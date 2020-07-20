
const findIndex = require('lodash/findIndex');
const reduce = require('lodash/reduce');
const map = require('lodash/map');
const { continentReinforcements } = require('../../../data/game-territory-list.json');

const COMBINED_STARTING_ARMIES = 80;

module.exports = GameInstanceState => class extends GameInstanceState {
  calculatePlayerReinforcements(player) {
    const playerTerritories = this.getPlayerTerritories(player.id);
    const reinforcementsFromTerritories = Math.floor(playerTerritories.length / 3);
    const ownedContinents = this.checkContinentOwnership(player);
    const playerContinentReinforcements = reduce(
      ownedContinents,
      (result, continent) => {
        const reinforcements = continentReinforcements[continent];
        return result + reinforcements;
      }, 0
    );

    return reinforcementsFromTerritories + playerContinentReinforcements;
  }

  calculateStartingReinforcements() {
    return Math.floor(COMBINED_STARTING_ARMIES / this.players.length);
  }

  setPlayerReinforcements({ player, numReinforcements }) {
    const playerIndexToUpdate = findIndex(this.players, ({ id }) => id === player.id);
    this.players[playerIndexToUpdate].reinforcements += numReinforcements;
  }

  setStartingReinforcements() {
    const startingReinforcementsPerPlayer = this.calculateStartingReinforcements();
    this.players = map(this.players, player => ({
      ...player,
      reinforcements: startingReinforcementsPerPlayer
    }));
  }
};
