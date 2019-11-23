const find = require('lodash/find');
const random = require('lodash/random');
const map = require('lodash/map');
const reduce = require('lodash/reduce');
const has = require('lodash/has');
const sample = require('lodash/sample');

const logger = require('./helpers/logger');
const BotConnection = require('./helpers/connection');

/**
 * Base implementation of bot
 */
module.exports = class BaseBot extends BotConnection {
  constructor(props) {
    super(props);

    this.gameJoined = false;
    this.isBotsTurn = false;
    this.botNames = [
      'base-napoleon-bot-aparte',
      'base-bot-alexander',
      'base-bot-julius-caesar',
      'base-bot-mark-antony'
    ];
    this.botProperties = {
      name: (props && props.name) ? props.name : false,
      color: false
    };

    this.events = {
      listGames: 'list-games',
      joinGame: 'join-game',
      getGameDetails: 'get-game-details',
      gameDetails: 'game-details',
      updatePlayer: 'update-player',
      updateTurn: 'update-turn',
      attackTerritory: 'attack-territory',
      turnEnd: 'turn-end',
      gameVictory: 'game-victory',
      territoryClicked: 'territory-clicked'
    };

    // these get automatically bound as socket listeners
    // via the connection class
    // a private version is maintained there on a setter
    // using a shallow clone
    this.handlers = {
      [this.events.listGames]: this.joinGame,
      [this.events.gameDetails]: this.turn,
      [this.events.updateTurn]: this.updateTurn,
      [this.events.gameVictory]: this.gameVictory
    };

    this.emitUpdatePlayer = playerInfo => this.sleep(
      () => this.socket.emit(this.events.updatePlayer, playerInfo)
    );
    this.emitSelectTerritory = selectedTerritory => this.sleep(
      () => this.socket.emit(this.events.territoryClicked, selectedTerritory)
    );
    this.emitAttackTerritory = config => this.sleep(
      () => this.socket.emit(this.events.attackTerritory, config)
    );
    this.emitTurnEnd = () => this.sleep(
      () => this.socket.emit(this.events.turnEnd)
    );
    this.emitGetGameDetails = gameID => this.sleep(
      () => this.socket.emit(this.events.getGameDetails, gameID)
    );
    this.emitJoingame = selectedGame => this.sleep(
      () => this.socket.emit(this.events.joinGame, { selectedGame })
    );
  }

  get botPlayerID() {
    return this.socket && this.socket.id;
  }

  /**
   * Find a game that includes the keyword bot and try to join it
   * @param {*} gameDetails
   */
  joinGame({ games }) {
    logger.debug('attempt-join-game');
    const botGame = find(games, game => game.id.includes('bot'));
    const isBotandGameAvailable = !this.gameJoined && botGame && botGame.id;

    // if not checked will causes an infinite loop
    if (!isBotandGameAvailable) {
      return;
    }

    this.emitJoingame(botGame.id);
    this.emitGetGameDetails(botGame.id);
    this.gameJoined = true;

    logger.info('Joined game: %s', botGame.id);
  }

  /**
   * Updates internal state
   * @param {*} currentPlayerTurn
   */
  updateTurn(currentPlayerTurn) {
    this.isBotsTurn = currentPlayerTurn.id === this.botPlayerID;
  }

  /**
   * @param {*} gameDetails
   */
  turn(gameDetails) {
    logger.debug(this.events.gameDetails);
    const { players } = gameDetails;
    const botInfo = find(players, player => player.id === this.botPlayerID);

    const turnState = this.turnState(gameDetails);
    const turnActions = this.turnActions(gameDetails, botInfo);
    const turnStateOptions = Object.keys(turnState);
    // eslint-disable-next-line
    const firstTrueStateKey = (result, key) => !!turnState[key] ? key : result;
    const currentTurnState = reduce(turnStateOptions, firstTrueStateKey, 'noop');

    const turnStateActionExists = has(turnActions, currentTurnState);
    if (!turnStateActionExists) {
      logger.warn(`${currentTurnState} action does not exist in turnActions object`);
      turnActions.noop();
      return;
    }

    const selectedTurnAction = turnActions[currentTurnState];
    selectedTurnAction();
  }

  /**
   * @param {*} gameDetails
   */
  turnState({
    gameStarted,
    players,
    availableTerritories,
    isInitialPlacementFinished
  }) {
    const botInfo = find(players, player => player.id === this.botPlayerID);
    const isBotEarlyGameTurn = isInitialPlacementFinished && this.isBotsTurn;

    return {
      isGameLobby: !gameStarted,
      isInitialReinforcements: (
        !isBotEarlyGameTurn
        && availableTerritories.length < 1
        && this.isBotsTurn
        && botInfo.reinforcements > 0
      ),
      isPickAvailableTerritories: this.isBotsTurn && availableTerritories.length > 0,
      isTurnReinforcements: isBotEarlyGameTurn && botInfo.reinforcements > 0,
      isTurnAttack: isBotEarlyGameTurn && botInfo.reinforcements < 1
    };
  }

  /**
   * @param {Object} gameDetails
   * @param {Object} botInfo
   */
  turnActions(gameDetails, botInfo) {
    return {
      noop: () => { }, // no-operation
      isGameLobby: () => {
        this.gameLobby(gameDetails);
      },
      isPickAvailableTerritories: () => {
        this.pickAvailableTerritories(gameDetails);
      },
      isInitialReinforcements: () => {
        this.initialReinforcements(gameDetails);
      },
      isTurnReinforcements: () => {
        this.turnReinforcements(gameDetails, botInfo);
      },
      isTurnAttack: () => {
        this.turnAttack(gameDetails);
      },
      // handled by seperate socket event
      isTurnEndReinforcements: () => {}
    };
  }

  /**
   * Game lobby functionality for setting name and color
   */
  gameLobby({ players, colorOptions }) {
    logger.info('game-lobby');
    const randomIndex = random(0, colorOptions.length);
    const areRequiredPropsSet = this.botProperties.color && this.botProperties.name;

    if (areRequiredPropsSet) {
      return;
    }

    const gamePlayerNames = map(players, player => player.name);
    const selectedBotName = this.selectBotName(gamePlayerNames);
    this.botProperties.name = this.botProperties.name || selectedBotName;
    this.botProperties.color = colorOptions[randomIndex];
    logger.debug('Setting bot info: %o', this.botProperties);
    this.emitUpdatePlayer(this.botProperties);
  }

  /**
   * Players take turns to pick unclaimed territories
   * @param {*} gameDetails
   */
  pickAvailableTerritories({ availableTerritories }) {
    logger.debug('pickAvailableTerritories');
    const selectedTerritory = sample(availableTerritories);

    logger.info(`Bot has claimed ${selectedTerritory}`);
    this.emitSelectTerritory(selectedTerritory);
  }

  /**
   * Before early game and after initially picking a territory
   * @param {*} gameDetails updated from the server with newest info
   */
  initialReinforcements({ territoryMap }) {
    logger.debug('initialReinforcements');

    const botTerritories = territoryMap[this.botPlayerID];
    const selectedTerritory = sample(botTerritories);

    logger.info(`Reinforcing: ${selectedTerritory}`);
    this.emitSelectTerritory(selectedTerritory);
  }

  /**
   * For Base version use random strategy like initial reinforcements
   * @param {*} gameDetails updated from the server with newest info
   * @param {*} botInfo updated from the server with newest info
   */
  turnReinforcements(gameDetails, botInfo) {
    this.initialReinforcements(gameDetails, botInfo);
  }

  /**
   * Base bot Doesn't attack, only reinforces
   * @param {*} gameDetails
   */
  turnAttack(gameDetails) {
    logger.silly('%o', gameDetails);
    this.emitTurnEnd();
  }

  /**
   * @param {String} playerID that has won the game
   */
  gameVictory(playerID) {
    logger.info('game-ended');
    if (playerID === this.botPlayerID) {
      logger.info('I have Won the game!');
      process.exit(0);
      return;
    }

    logger.info('I lost! :( May the scripter improve my logic');
    process.exit(1);
  }

  /**
   * @param {Array} gamePlayerNames to pick from
   */
  selectBotName(gamePlayerNames) {
    return reduce(this.botNames, (result, nameOption) => {
      const isUniqueName = gamePlayerNames.every(name => name !== nameOption);
      if (isUniqueName) {
        return nameOption;
      }

      return result;
    }, 'base-bot');
  }
};
