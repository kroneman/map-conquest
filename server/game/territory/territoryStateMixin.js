const has = require('lodash/has');
const filter = require('lodash/filter');
const sample = require('lodash/sample');
// const uniqBy = require('lodash/uniqBy');
const findIndex = require('lodash/findIndex');
const difference = require('lodash/difference');
const logger = require('../../logger');

const originalTerritoryList = require('../../../data/game-territory-list.json').territories;
const territoryListByContinent = require('../../../data/game-territory-list.json').continents;

const messages = {
  playerMustOwnBothTerritories: 'Player Must Own Both Territories To reinforce',
  invalidReinforcementAmount: 'Must leave at least one army in territory reinforcing from',
  playerDoesntHaveColor: 'Something went wrong, player doesn\'t have an assigned color',
  noTerritoryID: territoryID => `TerritoryID: ${territoryID} does not exist`,
  cantReinforceTerritoryPlayerDoesntOwn: territoryID => `Cant reinforce ${territoryID} as you don't own it`,
  territoryNotClaimed: territoryID => `TerritoryID: ${territoryID} has not been claimed yet`
};

module.exports = GameInstanceState => class extends GameInstanceState {
  constructor(props) {
    super(props);

    this.territories = {};
    this.continents = territoryListByContinent;

    Object.defineProperty(this, 'availableTerritories', {
      get() {
        const taken = Object.keys(this.territories);
        return filter(
          originalTerritoryList,
          territory => !taken.includes(territory)
        );
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(this, 'territoryMap', {
      get() {
        const newTerritoryMap = {};
        Object.keys(this.territories).forEach((territoryKey) => {
          const { playerID } = this.territories[territoryKey];

          if (!has(newTerritoryMap, playerID)) {
            newTerritoryMap[playerID] = [];
          }

          newTerritoryMap[playerID].push(territoryKey);
        });
        return newTerritoryMap;
      },
      enumerable: true,
      configurable: true
    });

    Object.defineProperty(this, 'continentOwnership', {
      enumerable: true,
      configurable: true,
      get() {
        const continentOwnership = {};
        Object.keys(this.territoryMap).forEach((playerID) => {
          const continentsOwned = [];
          const playerTerritories = this.getPlayerTerritories(playerID);
          const continentKeys = Object.keys(territoryListByContinent);
          let lenContinentKeys = continentKeys.length;
          while (lenContinentKeys) {
            lenContinentKeys -= 1;
            const currentContinentKey = continentKeys[lenContinentKeys];
            const currentContinentTerritories = territoryListByContinent[currentContinentKey];
            const differenceBetween = difference(currentContinentTerritories, playerTerritories);
            const noDifference = differenceBetween.length < 1;
            if (noDifference) {
              continentsOwned.push(currentContinentKey);
            }
          }

          continentOwnership[playerID] = continentsOwned;
        });

        return continentOwnership;
      }
    });
  }

  /**
   * @returns {array<string>} territories claimed by players
   */
  get allTerritories() {
    return Object.keys(this.territories);
  }

  /**
   * @returns {boolean}
   */
  get territoriesAreAvailable() {
    return this.availableTerritories.length > 0;
  }

  /**
   * Resets territory object
   */
  resetTerritories() {
    this.territories = {};
  }

  /**
   * @param {string} territoryID
   * @param {object} player
   * @returns {object} success and [message]
   */
  claimTerritory(territoryID, player) {
    if (has(this.territories, territoryID)) {
      return {
        success: false,
        message: messages.noTerritoryID(territoryID)
      };
    }

    if (!player.color) {
      return {
        success: false,
        message: messages.playerDoesntHaveColor
      };
    }

    this.territories[territoryID] = {
      color: player.color,
      playerID: player.id,
      armies: 1
    };
    return {
      success: true
    };
  }

  /**
   * @param {string} territoryID
   * @returns {null|object}
   */
  getTerritory(territoryID) {
    if (!has(this.territories, territoryID)) {
      logger.warn('getTerritory: territory \'%s\', does not exist', territoryID);
      return null;
    }

    return this.territories[territoryID];
  }

  /**
   * @param {string} territoryID to check
   * @param {object} player @todo refactor this to accept ID only
   * @returns {boolean}
   */
  isPlayersTerritory(territoryID, player) {
    const territory = this.getTerritory(territoryID);
    logger.debug('isPlayersTerritory: %o', territory);
    return territory && territory.playerID === player.id;
  }

  /**
   * @param {string} playerID
   * @returns {array<string>}
   */
  getPlayerTerritories(playerID) {
    const { territoryMap } = this;
    const playerHasTerritories = has(territoryMap, playerID);
    return playerHasTerritories ? territoryMap[playerID] : [];
  }

  /**
   * @param {string} playerID
   * @returns {object} territory
   */
  getRandomPlayerTerritory(playerID) {
    const playerTerritories = this.getPlayerTerritories(playerID);
    return sample(playerTerritories);
  }

  /**
   * @param {string} territoryID
   * @param {number} armiesLost
   * @returns {void}
   */
  territoryLosesArmies(territoryID, armiesLost = 1) {
    if (armiesLost > this.territories[territoryID].armies) {
      throw new Error('Territory cant go into negative armies');
    }

    this.territories[territoryID].armies -= armiesLost;
  }

  /**
   * @param {string} territoryID
   * @returns {boolean} success and message props
   */
  clearTerritoryClaim(territoryID) {
    if (!has(this.territories, territoryID)) {
      return {
        success: false,
        message: messages.territoryNotClaimed(territoryID)
      };
    }

    this.territories[territoryID] = {
      color: 'currentColor',
      armies: 0
    };

    return {
      success: true
    };
  }

  /**
   * @param {string} territoryID
   * @param {string} playerID
   * @param {number} armies
   * @returns {boolean}
   */
  takeOverTerritory(territoryID, playerID, armies) {
    const isTerritory = has(this.territories, territoryID);
    // think about removing player, dependency makes it difficult to test
    const player = this.getPlayer(playerID);
    const territory = isTerritory ? this.territories[territoryID] : false;
    const isEmpty = territory && territory.armies === 0;
    if (!isEmpty) {
      return false;
    }

    this.territories[territoryID] = {
      color: player.color,
      playerID: player.id,
      armies
    };

    this.checkContinentOwnership(player.id);
    return true;
  }

  /**
   * @param {string} territoryID
   * @param {object} player
   * @returns {object}
   */
  reinforceTerritory(territoryID, player) {
    const isPlayersTerritory = this.isPlayersTerritory(territoryID, player);
    if (!isPlayersTerritory) {
      return {
        success: false,
        message: messages.cantReinforceTerritoryPlayerDoesntOwn(territoryID)
      };
    }

    // same here, see if it's possible to remove the player
    const playerIndexToUpdate = findIndex(this.players, ({ id }) => id === player.id);
    const reinforceBy = 1;

    this.territories[territoryID].armies += reinforceBy;
    this.players[playerIndexToUpdate].reinforcements -= reinforceBy;
    return {
      success: true
    };
  }

  /**
   * @param {object} player
   * @param {{ reinforceFrom: string, reinforceTo: string, amount: number }} reinforceConfig
   */
  reinforceTerritoryFromAnother(player, reinforceConfig) {
    const { reinforceFrom, reinforceTo, amount } = reinforceConfig;
    const playerOwnsTerritories = [reinforceFrom, reinforceTo].every(
      territoryId => this.isPlayersTerritory(territoryId, player)
    );

    if (!playerOwnsTerritories) {
      logger.error(messages.playerMustOwnBothTerritories);
      return {
        success: false,
        message: messages.playerMustOwnBothTerritories
      };
    }

    const territoryFrom = this.getTerritory(reinforceFrom);
    const validAmount = territoryFrom.armies > amount;
    if (!validAmount) {
      return {
        success: false,
        message: messages.invalidReinforcementAmount
      };
    }

    this.territories[reinforceFrom].armies -= amount;
    this.territories[reinforceTo].armies += amount;
    return {
      success: true
    };
  }

  checkContinentOwnership(player) {
    const { continentOwnership } = this;
    const ownsContinent = has(continentOwnership, player.id);
    return ownsContinent ? this.continentOwnership[player.id] : [];
  }
};
