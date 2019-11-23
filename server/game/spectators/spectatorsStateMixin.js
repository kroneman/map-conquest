const filter = require('lodash/filter');
const find = require('lodash/find');

module.exports = GameInstanceState => class extends GameInstanceState {
  constructor(props) {
    super(props);
    this.spectators = [];
  }

  addSpectator(player) {
    const isAlreadySpectator = this.isGameSpectator(player);
    if (isAlreadySpectator) {
      return;
    }

    this.spectators = [
      ...this.spectators,
      player
    ];
  }

  removeSpectator(player) {
    const filteredSpectators = filter(this.spectators, ({ id }) => id !== player.id);
    this.spectators = [
      ...filteredSpectators
    ];
  }

  getSpectator(playerID) {
    return find(this.spectators, ({ id }) => id === playerID);
  }

  isGameSpectator({ id }) {
    return filter(this.spectators, spectator => id === spectator.id).length > 0;
  }

  hasSpectators() {
    return this.spectators.length > 0;
  }
};
