const has = require('lodash/has');
const reduce = require('lodash/reduce');
const logger = require('../../logger');
const gameState = require('../state');
const { territoryDiceRoll } = require('../helpers/dice');

const messages = {
  playersMustHaveColor: 'all players must have colors assigned before starting',
  cannotStartGameAlreadyStarted: 'Cannot start game that has already started'
};

/**
 * Connection handlers for events scoped to a game instance
 */
module.exports = ConnectionClass => class extends ConnectionClass {
  constructor(props) {
    super(props);

    this.events = {
      startGame: 'start-game',
      startGameError: 'start-game-error',
      updatePlacementConfig: 'update-placement-config',
      updateReinforcementConfig: 'update-reinforcement-config',
      gameDetails: 'game-details',
      getGameDetails: 'get-game-details',
      gameVictory: 'game-victory',
      territoryClicked: 'territory-clicked',
      updatePlayerTurn: 'update-turn',
      attackTerritory: 'attack-territory',
      attackTerritorySuccess: 'attack-territory-success',
      turnReinforceTerritory: 'turn-reinforce-territory',
      turnReinforceTerritoriesStart: 'turn-reinforce-territories-start',
      turnReinforceTerritories: 'turn-reinforce-territories',
      turnEndAttack: 'turn-end-attack',
      turnEnd: 'turn-end',
      gameErrorNotification: 'game-error-notification'
    };

    this.handlers = {
      [this.events.startGame]: this.startGame,
      [this.events.updatePlacementConfig]: this.updatePlacementConfig,
      [this.events.updateReinforcementConfig]: this.updateReinforcementConfig,
      [this.events.getGameDetails]: this.getGameDetails,
      [this.events.territoryClicked]: this.territoryClicked,
      [this.events.attackTerritory]: this.turnAttackTerritory,
      [this.events.turnReinforceTerritoriesStart]: this.turnReinforceTerritoriesStart,
      [this.events.turnReinforceTerritory]: this.turnReinforceTerritory,
      [this.events.turnEnd]: this.turnEnd
    };
  }

  get gameID() {
    return gameState.getRoomAssignment(this.playerID);
  }

  get gameInstance() {
    const gameID = gameState.getRoomAssignment(this.playerID);
    return gameState.getGameInstance(gameID);
  }

  startGame() {
    logger.debug(this.events.startGame);
    if (this.gameInstance.gameStarted) {
      logger.debug(messages.cannotStartGameAlreadyStarted);

      if (this.gameInstance.isGameSpectator({ id: this.playerID })) {
        // only emit to spectator UI that the game has started, rest are in game
        this.socket.emit(this.events.startGame);
      }
      return;
    }

    const readyToStart = this.gameInstance.startGame();
    logger.debug('readyToStart: %s', readyToStart);
    if (!readyToStart) {
      logger.debug(this.events.startGameError);
      this.emitToAllInGame(this.events.startGameError, messages.playersMustHaveColor);
      return;
    }

    logger.debug(this.events.updatePlayerTurn);
    this.emitToAllInGame(this.events.startGame);
    const currentPlayerTurn = this.gameInstance.playerTurn;
    this.emitToAllInGame(this.events.updatePlayerTurn, currentPlayerTurn);
    logger.debug(currentPlayerTurn);
  }

  updatePlacementConfig(mode) {
    logger.debug(this.events.updatePlacementConfig);
    this.gameInstance.setPlacement(mode);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  updateReinforcementConfig(mode) {
    logger.debug(this.events.updateReinforcementConfig);
    this.gameInstance.setReinforcement(mode);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  /**
   * Retrieves game details for pregame lobby end emits to client
   * @param {String} id of game to retrieve id for
   */
  getGameDetails(id) {
    logger.debug(this.events.getGameDetails);

    const gameRoom = this.rooms[id];
    const connectionsInGame = gameRoom && gameRoom.sockets;
    if (!connectionsInGame) {
      return;
    }

    const isAllowed = has(connectionsInGame, this.socket.id);
    if (!isAllowed) {
      // send some kind of error back that they're not allowed
      // for now just ignore and let them be unresponsive
      return;
    }

    this.gameInstance.removeInactivePlayers(Object.keys(connectionsInGame));
    logger.silly(`${this.events.getGameDetails} %0`, this.gameInstance);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  /**
   * First Phase of a players turn
   * @param {String} territoryName
   */
  async turnDraftReinforcements(territoryName) {
    const player = this.gameInstance.getPlayer(this.playerID);
    const isPlayersTerritory = this.gameInstance.isPlayersTerritory(territoryName, player);

    if (player.reinforcements < 1 || !isPlayersTerritory) {
      this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
      return;
    }
    await this.gameInstance.reinforceTerritory(territoryName, player);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  /**
   * @param {{ attackerID: String, defenderID: string }} attackConfig
   * @returns {Boolean}
   */
  isValidAttack({ attackerID, defenderID }) {
    const player = this.gameInstance.getPlayer(this.playerID);
    const isAttackingFromOwnTerritory = this.gameInstance.isPlayersTerritory(attackerID, player);
    const isAttackingOwnTerritory = this.gameInstance.isPlayersTerritory(defenderID, player);
    return isAttackingFromOwnTerritory && !isAttackingOwnTerritory;
  }

  /**
   * Phase two handler when a player wants to attack another territory
   * @param {object} territoriesAtWar
   * @returns {void}
   */
  turnAttackTerritory({ attackerID, defenderID }) {
    logger.debug(this.events.turnAttackTerritory);
    if (!this.isValidAttack({ attackerID, defenderID })) {
      // make sure they have an updated list of his own territories
      this.gameInstance.updateContinentOwnership();
      this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
      return;
    }

    const territoryAttackConfig = {
      attackingTerritory: this.gameInstance.getTerritory(attackerID),
      defendingTerritory: this.gameInstance.getTerritory(defenderID)
    };
    const {
      isDefenderBased,
      winners,
      attackingTerritoryDiceRolls
    } = territoryDiceRoll(territoryAttackConfig);

    let lenWinners = winners.length;
    while (lenWinners) {
      lenWinners -= 1;
      const isVictory = winners[lenWinners];
      if (isDefenderBased) {
        const loserTerritoryID = isVictory ? attackerID : defenderID;
        logger.info(`${isVictory ? 'attacker' : 'defender'} loses 1 army at ${loserTerritoryID}`);
        this.gameInstance.territoryLosesArmies(loserTerritoryID);
      } else {
        const loserTerritoryID = isVictory ? defenderID : attackerID;
        logger.info(`${isVictory ? 'defender' : 'attacker'} loses 1 army at ${loserTerritoryID}`);
        this.gameInstance.territoryLosesArmies(loserTerritoryID);
      }
    }

    const attackingTerritoryResult = this.gameInstance.getTerritory(attackerID);
    const defendingTerritoryResult = this.gameInstance.getTerritory(defenderID);
    const defenderHasNoArmies = defendingTerritoryResult.armies === 0;

    if (defenderHasNoArmies) {
      // let minTransferArmies = attackingTerritoryDiceRolls.length;
      const minTransferArmies = (attackingTerritoryResult.armies > 5)
        ? Math.floor(attackingTerritoryResult.armies / 2)
        : attackingTerritoryDiceRolls.length;
      this.gameInstance.territoryLosesArmies(attackerID, minTransferArmies);
      this.gameInstance.takeOverTerritory(defenderID, this.playerID, minTransferArmies);
      const updatedAttackerTerritory = this.gameInstance.getTerritory(attackerID);
      const updatedDefendingTerritory = this.gameInstance.getTerritory(defenderID);
      const attackerReinforceConfig = {
        attackerTerritory: {
          id: attackerID,
          ...updatedAttackerTerritory
        },
        defendingTerritory: {
          id: defenderID,
          ...updatedDefendingTerritory
        }
      };

      // if after transferring dice rolls there are no armies to reinforce with
      // dont give players the option
      const hasTransferrableArmies = updatedAttackerTerritory.armies > 1;
      if (hasTransferrableArmies) {
        this.socket.emit(this.events.attackTerritorySuccess, {
          attackerReinforceConfig,
          gameDetails: this.gameInstance
        });
      }
    }

    const isVictoryAchieved = this.gameInstance.victoryCondition(this.playerID);
    if (isVictoryAchieved) {
      logger.debug(`${this.playerID}: has won the game!`);
      this.emitToAllInGame(this.events.gameVictory, this.playerID);
      return;
    }

    logger.debug('%o', this.gameInstance);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  turnReinforceTerritory({ reinforceFrom, reinforceTo, amount }) {
    const player = this.gameInstance.getPlayer(this.playerID);
    const amountAsInt = parseFloat(amount);
    const { success, message } = this.gameInstance.reinforceTerritoryFromAnother(player, {
      reinforceFrom, reinforceTo, amount: amountAsInt
    });

    if (!success) {
      logger.error(message);
      this.socket.emit(this.events.gameErrorNotification, message);
      return;
    }

    this.socket.emit(this.events.turnReinforceTerritory, true);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  /**
   * Phase three of a players turn where they can reinforce territories
   * @returns {void}
   */
  turnReinforceTerritoriesStart() {
    logger.debug('turnReinforceTerritoriesStart');
    this.emitToAllInGame(this.events.turnReinforceTerritories);
  }

  /**
   * @param {string} territoryName - id of a territory
   * @returns {void}
   */
  territoryClicked(territoryName) {
    logger.debug(this.events.territoryClicked);
    const playersTurn = this.gameInstance.playerTurn;
    const isClickedPlayersTurn = this.gameInstance.isPlayersTurn(this.playerID);

    if (!isClickedPlayersTurn) {
      this.emitToAllInGame(this.events.updatePlayerTurn, playersTurn);
      this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
      return;
    }

    const areTerritoriesAvailable = this.gameInstance.areTerritoriesAvailable();
    const isVictoryAchieved = this.gameInstance.victoryCondition(this.playerID);
    const isPlacementPhaseDone = !isVictoryAchieved
      && this.gameInstance.checkInitialPlacementPhase();
    const state = {
      isPlacementPhaseDone,
      areTerritoriesAvailable,
      isReinforceSingleTerritory: !(isPlacementPhaseDone || areTerritoriesAvailable),
      isVictoryAchieved
    };

    const actions = {
      isPlacementPhaseDone: () => this.turnDraftReinforcements(territoryName),
      areTerritoriesAvailable: () => this.claimTerritory(territoryName),
      isReinforceSingleTerritory: () => this.reinforceSingleTerritory(territoryName),
      isVictoryAchieved: () => { logger.info(`${this.playerID}: has won the game!`); },
      noop: () => { logger.info('noop'); }
    };

    const stateOptions = Object.keys(state);
    // eslint-disable-next-line
    const currentState = reduce(stateOptions, (result, key) => !!state[key] ? key : result, 'noop');
    logger.silly(currentState);

    if (!has(actions, currentState)) {
      logger.error(`${currentState} does not exist in possible actions`);
      return;
    }

    const selectedStateAction = actions[currentState];
    selectedStateAction();
  }

  /**
   * If there are unclaimed territories at the begginging of the game
   * This grabs the territory for a player
   * @param {string} territoryName to claim
   * @returns {void}
   */
  claimTerritory(territoryName) {
    logger.debug('claimTerritory');
    const player = this.gameInstance.getPlayer(this.playerID);
    const { success, message } = this.gameInstance.claimTerritory(territoryName, player);
    if (!success) {
      logger.error(message);
      this.socket.emit(this.events.gameErrorNotification, message);
      return;
    }

    const playerTerritories = this.gameInstance.getPlayerTerritories(this.playerID);
    const nextPlayerTurn = this.gameInstance.updatePlayersTurn();

    logger.debug(playerTerritories);
    this.emitToAllInGame(this.events.updatePlayerTurn, nextPlayerTurn);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  /**
   * Reinforces a single territory and updates player turn
   * @param {string} territoryName to reinforce
   * @returns {void}
   */
  reinforceSingleTerritory(territoryName) {
    logger.debug('reinforceSingleTerritory');
    const player = this.gameInstance.getPlayer(this.playerID);

    if (player.reinforcements < 1) {
      return;
    }

    const { success, message } = this.gameInstance.reinforceTerritory(territoryName, player);
    if (!success) {
      logger.error(message);
      this.socket.emit(this.events.gameErrorNotification, message);
      return;
    }
    const nextPlayerTurn = this.gameInstance.updatePlayersTurn();
    const isPlacementPhaseDone = this.gameInstance.checkInitialPlacementPhase();

    if (isPlacementPhaseDone) {
      const playerReinforcements = this.gameInstance.calculatePlayerReinforcements(nextPlayerTurn);
      this.gameInstance.setPlayerReinforcements({
        player: nextPlayerTurn,
        numReinforcements: playerReinforcements
      });
    }

    this.emitToAllInGame(this.events.updatePlayerTurn, nextPlayerTurn);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }

  /**
   * End of a players turn
   */
  turnEnd() {
    logger.debug(this.events.turnEnd);
    const isClickedPlayersTurn = this.gameInstance.isPlayersTurn(this.playerID);
    if (!isClickedPlayersTurn) {
      this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
      return;
    }

    const isPlacementPhaseDone = this.gameInstance.checkInitialPlacementPhase();
    const nextPlayerTurn = this.gameInstance.updatePlayersTurn();

    if (isPlacementPhaseDone) {
      const playerReinforcements = this.gameInstance.calculatePlayerReinforcements(nextPlayerTurn);
      this.gameInstance.setPlayerReinforcements({
        player: nextPlayerTurn,
        numReinforcements: playerReinforcements
      });
    }

    this.emitToAllInGame(this.events.updatePlayerTurn, nextPlayerTurn);
    this.emitToAllInGame(this.events.gameDetails, this.gameInstance);
  }
};
