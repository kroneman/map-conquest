const filter = require('lodash/filter');
const find = require('lodash/find');

module.exports = GameInstanceState => class extends GameInstanceState {
  constructor(props) {
    super(props);
    this.spectators = [];
  }

  /**
   * @returns {boolean}
   */
  get hasSpectators() {
    return this.spectators.length > 0;
  }

  /**
   * @param {object} player
   * @returns {boolean}
   */
  addSpectator(player) {
    const isAlreadySpectator = this.isSpectator(player.id);
    if (isAlreadySpectator) {
      return false;
    }

    this.spectators = [
      ...this.spectators,
      player
    ];
    return true;
  }

  /**
   * @param {object} player
   */
  removeSpectator(player) {
    const filteredSpectators = filter(this.spectators, ({ id }) => id !== player.id);
    this.spectators = [
      ...filteredSpectators
    ];
  }

  /**
   * @param {string} id
   * @returns {object}
   */
  getSpectator(id) {
    return find(this.spectators, spectator => id === spectator.id) || null;
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  isSpectator(id) {
    return filter(this.spectators, spectator => spectator.id === id).length > 0;
  }

  /**
   * @returns {void}
   */
  removeAllSpectators() {
    this.spectators = [];
  }
};
