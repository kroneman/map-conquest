const filter = require('lodash/filter');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const map = require('lodash/map');
const find = require('lodash/find');

const originalColorOptions = [
  '#000', // black
  '#720000', // red
  '#025839', // dark-green
  '#4013AF', // blue
  '#04859D' // light-blue
];

module.exports = GameInstanceState => class extends GameInstanceState {
  constructor(props) {
    super(props);
    this.players = [];
    this.playerTurnIndex = 0;

    Object.defineProperty(this, 'colorOptions', {
      get() {
        const takenColors = map(this.players, player => player.color);
        return filter(originalColorOptions, color => !takenColors.includes(color));
      },
      // defineProperty to make this getter enumerable
      enumerable: true,
      configurable: true
    });
  }

  /**
   * Reactive Getters properties
   */
  get playerTurn() {
    if (!isArray(this.players) || this.players.length < 1) {
      return null;
    }

    return this.players[this.playerTurnIndex];
  }

  get hasPlayers() {
    return this.players.length > 0;
  }

  /**
   * Adds a player to a game's state
   * @param {Object} player -
   * @returns {Boolean} success or failure of operation
   */
  addPlayer(player) {
    const isAlreadyPlayer = filter(this.players, ({ id }) => id === player.id).length > 0;
    if (isAlreadyPlayer) {
      return false;
    }

    // the more players the less reinforcements
    const playerWithArmies = {
      ...player,
      // !!!!!!!!!!!! refactor this part with the armies
      reinforcements: 40
    };

    this.players = [
      ...this.players,
      playerWithArmies
    ];
    return true;
  }

  /**
   * @param {Object} player -
   * @returns {Boolean} success or failure of operation
   */
  removePlayer(player) {
    const filteredPlayers = filter(this.players, ({ id }) => id !== player.id);
    if (filteredPlayers.length === this.players.length) {
      return false;
    }

    this.players = [
      ...filteredPlayers
    ];

    return true;
  }

  /**
   * @param {String} playerID
   * @returns {Object} player
   */
  getPlayer(playerID) {
    if (!isString(playerID)) {
      // Not sure if i like empty objects
      return {};
    }

    return find(this.players, player => player.id === playerID);
  }

  /**
   * Update a player in the list
   * @param {string} playerID
   * @param {string} playerData
   * @returns {boolean} success or failure to update
   */
  updatePlayer(playerID, playerData) {
    let isSuccess = false;
    if (this.players.length < 1) {
      return isSuccess;
    }

    const updatedPlayers = map(this.players, (player) => {
      if (player.id !== playerID) {
        return player;
      }

      // Mark operation successful
      isSuccess = true;
      return {
        ...player,
        ...playerData
      };
    });

    this.players = updatedPlayers;
    return isSuccess;
  }

  /**
   * Pass an array of active players and filter the other ones out
   * @param {Array<string>} activePlayers
   */
  removeInactivePlayers(activePlayers = []) {
    if (!activePlayers || !isArray(activePlayers)) {
      return false;
    }

    const filteredPlayers = filter(this.players, player => activePlayers.includes(player.id));
    this.players = [
      ...filteredPlayers
    ];

    return true;
  }

  /**
   * Check's if it's the turn of the playerID passed
   * @param {*} playerID
   * @returns {boolean}
   */
  isPlayersTurn(playerID) {
    const { playerTurn } = this;
    return Boolean(playerTurn) && playerID === playerTurn.id;
  }

  /**
   * Checks the ID of a passed player to see if they are a member of the current game
   * @FIXME: onlyRequire ID
   * @param {*} player
   * @returns {boolean}
   */
  isPlayer(id) {
    return filter(this.players, player => id === player.id).length > 0;
  }

  /**
   * Updates the currently active players's turn
   * @returns {object} object of the current players turn
   */
  updatePlayersTurn() {
    if (this.playerTurnIndex === (this.players.length - 1)) {
      this.playerTurnIndex = 0;
      return this.playerTurn;
    }

    this.playerTurnIndex += 1;
    return this.playerTurn;
  }
};
