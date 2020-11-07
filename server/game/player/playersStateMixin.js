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
   * playerTurn based on playerTurnIndex
   * @returns {null|object}
   */
  get playerTurn() {
    if (!isArray(this.players) || this.players.length < 1) {
      return null;
    }

    return this.players[this.playerTurnIndex];
  }

  /**
   * @returns {boolean}
   */
  get hasPlayers() {
    return this.players.length > 0;
  }

  /**
   * Checks the ID of a passed player to see if they are a member of the current game
   * @param {string} id of the player to remove
   * @returns {boolean}
   */
  isPlayer(id) {
    return filter(this.players, player => id === player.id).length > 0;
  }

  /**
   * Adds a player to a game's state
   * @param {object} player -
   * @returns {boolean} success or failure of operation
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
   * @param {object} player -
   * @returns {boolean} success or failure of operation
   */
  removePlayer(id) {
    if (!isString(id)) {
      // eslint-disable-next-line no-console
      console.warn('removePlayer: id must be a string');
      return false;
    }

    const filteredPlayers = filter(this.players, player => id !== player.id);
    if (filteredPlayers.length === this.players.length) {
      return false;
    }

    this.players = [
      ...filteredPlayers
    ];

    return true;
  }

  /**
   * @param {String} id
   * @returns {object} player
   */
  getPlayer(id) {
    if (!isString(id)) {
      // Not sure if i like empty objects
      return {};
    }

    return find(this.players, player => player.id === id);
  }

  /**
   * Update a player in the list
   * @param {string} id
   * @param {string} playerData
   * @returns {boolean} success or failure to update
   */
  updatePlayer(id, playerData) {
    let isSuccess = false;
    if (this.players.length < 1) {
      return isSuccess;
    }

    const updatedPlayers = map(this.players, (player) => {
      if (player.id !== id) {
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
   * @returns {boolean}
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
   * @param {string} id
   * @returns {boolean}
   */
  isPlayersTurn(id) {
    const { playerTurn } = this;
    return Boolean(playerTurn) && id === playerTurn.id;
  }

  /**
   * Updates the currently active player's turn
   * @returns {object} of the current player's turn
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
