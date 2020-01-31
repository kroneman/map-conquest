const filter = require('lodash/filter');
const isArray = require('lodash/isArray');
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
    this.colorOptions = originalColorOptions;
  }

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
      reinforcements: 40
    };

    this.players = [
      ...this.players,
      playerWithArmies
    ];
    return true;
  }

  /**
   * Removes a player from the games state
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

  getPlayer(playerID) {
    return find(this.players, player => player.id === playerID);
  }

  updatePlayer(playerID, playerData) {
    const updatedPlayers = map(this.players, (player) => {
      if (player.id !== playerID) {
        return player;
      }

      return {
        ...player,
        ...playerData
      };
    });
    this.players = updatedPlayers;
  }

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

  isPlayersTurn(playerID) {
    const { playerTurn } = this;
    return Boolean(playerTurn) && playerID === playerTurn.id;
  }

  isGamePlayer({ id }) {
    return filter(this.players, player => id === player.id).length > 0;
  }

  updatePlayersTurn() {
    if (this.playerTurnIndex === (this.players.length - 1)) {
      this.playerTurnIndex = 0;
      return this.playerTurn;
    }

    this.playerTurnIndex += 1;
    return this.playerTurn;
  }

  updateColorOptions() {
    const takenColors = map(this.players, player => player.color);
    const availableColors = filter(originalColorOptions, color => !takenColors.includes(color));
    this.colorOptions = availableColors;
  }
};
