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

  addPlayer(player) {
    const isAlreadyPlayer = filter(this.players, ({ id }) => id === player.id).length > 0;
    if (isAlreadyPlayer) {
      return;
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
  }

  removePlayer(player) {
    const filteredPlayers = filter(this.players, ({ id }) => id !== player.id);
    this.players = [
      ...filteredPlayers
    ];
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

  filterConnections(activeSockets) {
    if (!activeSockets || !isArray(activeSockets)) {
      return;
    }
    const filteredPlayers = filter(this.players, player => activeSockets.includes(player.id));
    this.players = [
      ...filteredPlayers
    ];
  }

  isPlayersTurn(playerID) {
    const playerTurn = this.getPlayerTurn();
    return Boolean(playerTurn) && playerID === playerTurn.id;
  }

  isGamePlayer({ id }) {
    return filter(this.players, player => id === player.id).length > 0;
  }

  hasPlayers() {
    return this.players.length > 0;
  }

  getPlayerTurn() {
    return this.players[this.playerTurnIndex];
  }

  updatePlayersTurn() {
    if (this.playerTurnIndex === (this.players.length - 1)) {
      this.playerTurnIndex = 0;
      return this.getPlayerTurn();
    }

    this.playerTurnIndex += 1;
    return this.getPlayerTurn();
  }

  updateColorOptions() {
    const takenColors = map(this.players, player => player.color);
    const availableColors = filter(originalColorOptions, color => !takenColors.includes(color));
    this.colorOptions = availableColors;
  }
};
