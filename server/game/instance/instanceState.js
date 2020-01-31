const filter = require('lodash/filter');
const reduce = require('lodash/reduce');
const compose = require('lodash/fp/compose');

const logger = require('../../logger');

const playersMixin = require('../player/playersStateMixin');
const spectatorsMixin = require('../spectators/spectatorsStateMixin');
const territoryMixin = require('../territory/territoryStateMixin');
const reinforcementsMixin = require('../reinforcements/reinforcementsStateMixin');
const chatMixin = require('../chat/chatStateMixin');

const messages = {
  invalidPlacementMode: 'invalid placement mode selected',
  invalidReinforcementMode: 'invalid reinforcement mode selected'
};

// see https://alligator.io/js/class-composition/
const combinedFeatures = compose(
  playersMixin,
  spectatorsMixin,
  territoryMixin,
  reinforcementsMixin,
  chatMixin
);

const {
  DEBUG_GAME_PLACEMENT_MODE,
  DEBUG_GAME_REINFORCEMENT_MODE
} = process.env;

class GameInstanceState {
  constructor(props) {
    this.id = props.id;
    this.name = props.id;

    // options to start game as determined by server
    this.placementMode = DEBUG_GAME_PLACEMENT_MODE || 'manual';
    this.placementModeOptions = ['automatic', 'manual'];
    this.reinforcementMode = DEBUG_GAME_REINFORCEMENT_MODE || 'manual';
    this.reinforcementModeOptions = ['automatic', 'manual'];

    this.gameStarted = false;
    this.isInitialPlacementFinished = false;
  }

  startGame() {
    const readyPlayers = filter(this.players, player => !!player.color);
    const lenPlayers = this.players.length;
    const isPlayersAndAllPlayersReady = lenPlayers && readyPlayers.length === lenPlayers;
    if (isPlayersAndAllPlayersReady) {
      this.setStartingReinforcements();
      this.autoPlaceInitialPlacement();
      this.autoPlaceInitialReinforcements();
      this.gameStarted = true;
      return this.gameStarted;
    }

    return false;
  }

  victoryCondition(playerID) {
    if (!this.isInitialPlacementFinished) {
      return false;
    }

    const playersTerritories = this.territoryMap[playerID];
    return playersTerritories.length === this.allTerritories.length;
  }

  // refactor this to be a getter;
  checkInitialPlacementPhase() {
    if (this.isInitialPlacementFinished) {
      return this.isInitialPlacementFinished;
    }

    const sumReinforcements = (result, { reinforcements }) => result + reinforcements;
    const remainingArmies = reduce(this.players, sumReinforcements, 0);
    this.isInitialPlacementFinished = remainingArmies < 1;
    return this.isInitialPlacementFinished;
  }

  /**
   * When the game starts auto assign players reinforcements
   * This can be toggled on and off via a game lobby's settings
   * see this.reinforcementMode setting
   * @returns {void}
   */
  autoPlaceInitialReinforcements() {
    if (this.reinforcementMode === 'manual') {
      return;
    }

    while (!this.isInitialPlacementFinished) {
      const playersTurn = this.playerTurn;
      const randomTerritory = this.getRandomPlayerTerritory(playersTurn.id);
      this.reinforceTerritory(randomTerritory, playersTurn);
      this.updatePlayersTurn();
      this.checkInitialPlacementPhase();
    }
  }

  setReinforcement(mode) {
    if (!this.reinforcementModeOptions.includes(mode)) {
      logger.error(messages.invalidReinforcementMode);
      return;
    }

    this.reinforcementMode = mode;
  }

  isReinforcementMode(mode) {
    return this.reinforcementMode === mode;
  }

  getReinforcementMode() {
    return this.reinforcementMode;
  }

  /**
   * Auto assigns territories to players at the beginning of the game
   * Also can be toggled in on or off in a game lobby's settings
   * see: this.placementMode
   * @returns {void}
   */
  autoPlaceInitialPlacement() {
    if (this.placementMode === 'manual') {
      return;
    }

    this.availableTerritories.map((territoryId) => {
      const playersTurn = this.getPlayerTurn();

      this.claimTerritory(territoryId, playersTurn);
      return this.updatePlayersTurn();
    });
  }

  setPlacement(mode) {
    if (!this.placementModeOptions.includes(mode)) {
      logger.error(messages.invalidPlacementMode);
      return;
    }

    if (mode === 'manual') {
      this.setReinforcementMode(mode);
    }

    this.placementMode = mode;
  }

  isPlacementMode(mode) {
    return this.placementMode === mode;
  }

  getPlacementMode() {
    return this.placementMode;
  }
}

module.exports = combinedFeatures(GameInstanceState);
