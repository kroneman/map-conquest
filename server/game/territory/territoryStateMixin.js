const has = require('lodash/has');
const filter = require('lodash/filter');
const map = require('lodash/map');
const sample = require('lodash/sample');
const uniqBy = require('lodash/uniqBy');
const findIndex = require('lodash/findIndex');
const difference = require('lodash/difference');
const logger = require('../../logger');

const originalTerritoryList = require('../../../data/gameterritorylist.json').territories;
const territoryListByContinent = require('../../../data/gameterritorylist.json').continents;

const messages = {
  playerMustOwnBothTerritories: 'Player Must Own Both Territories To reinforce',
  invalidReinforcementAmmount: 'Must leave at least one army in territory reinforcing from',
  playerDoesntHaveColor: 'Something went wrong, player doesn\'t have an assigned color',
  noTerritoryID: territoryID => `TerritoryID: ${territoryID} does not exist`,
  cantReinforceTerritoryPlayerDoesntOwn: territoryID => `Cant reinforce ${territoryID} as you don't own it`,
  territoryNotClaimed: territoryID => `TerritoryID: ${territoryID} has not been claimed yet`
};

module.exports = GameInstanceState => class extends GameInstanceState {
  constructor(props) {
    super(props);

    this.territories = {};
    this.territoryMap = {};
    this.availableTerritories = originalTerritoryList;
  }

  get allTerritories() {
    return Object.keys(this.territories);
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

  isPlayersTerritory(territoryID, player) {
    const territory = this.getTerritory(territoryID);
    logger.debug('isPlayersTerritory: %o', territory);
    return territory && territory.claimedBy === player.id;
  }

  areTerritoriesAvailable() {
    return this.availableTerritories.length > 0;
  }

  updateAvailableTerritories() {
    const takenTerritories = Object.keys(this.territories);
    this.availableTerritories = filter(
      originalTerritoryList,
      territory => !takenTerritories.includes(territory)
    );
  }

  updateTerritoryMap() {
    map(this.players, ({ id }) => {
      this.getPlayerTerritories(id);
    });
  }

  getPlayerTerritories(playerID) {
    // reset territorymap so old values don't persist
    this.territoryMap[playerID] = [];
    map(this.territories, (value, prop) => {
      if (playerID === value.claimedBy) {
        this.territoryMap[playerID].push(prop);
        this.territoryMap[playerID] = uniqBy(this.territoryMap[playerID], v => v);
      }
    });

    return this.territoryMap[playerID];
  }

  getRandomPlayerTerritory(playerID) {
    const playerTerritories = this.getPlayerTerritories(playerID);
    return sample(playerTerritories);
  }

  territoryLosesArmies(territoryID, armiesLost = 1) {
    if (armiesLost > this.territories[territoryID].armies) {
      throw new Error('Territory cant go into negative armies');
    }

    this.territories[territoryID].armies -= armiesLost;
  }

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
      claimedBy: player.id,
      armies: 1
    };
    this.updateAvailableTerritories();
    this.updateTerritoryMap();
    return {
      success: true
    };
  }

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

  takeOverTerritory(territoryID, playerID, armies) {
    const isTerritory = has(this.territories, territoryID);
    const player = this.getPlayer(playerID);
    const territory = isTerritory ? this.territories[territoryID] : false;
    const isEmpty = territory && territory.armies === 0;
    if (!isEmpty) {
      return;
    }

    this.territories[territoryID] = {
      color: player.color,
      claimedBy: player.id,
      armies
    };

    this.updateTerritoryMap();
    this.checkContinentOwnership(player.id);
  }

  reinforceTerritory(territoryID, player) {
    const isPlayersTerritory = this.isPlayersTerritory(territoryID, player);
    if (!isPlayersTerritory) {
      return {
        success: false,
        message: messages.cantReinforceTerritoryPlayerDoesntOwn(territoryID)
      };
    }
    const playerIndexToUpdate = findIndex(this.players, ({ id }) => id === player.id);
    const reinforceBy = 1;

    this.territories[territoryID].armies += reinforceBy;
    this.players[playerIndexToUpdate].reinforcements -= reinforceBy;
    return {
      success: true
    };
  }

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
        message: messages.invalidReinforcementAmmount
      };
    }

    this.territories[reinforceFrom].armies -= amount;
    this.territories[reinforceTo].armies += amount;

    this.updateTerritoryMap();
    this.updateContinentOwnership();
    return {
      success: true
    };
  }

  updateContinentOwnership() {
    map(this.players, this.checkContinentOwnership.bind(this));
  }

  checkContinentOwnership(player) {
    const continentsOwned = [];
    const playerTerritories = this.getPlayerTerritories(player.id);

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

    return continentsOwned;
  }
};
