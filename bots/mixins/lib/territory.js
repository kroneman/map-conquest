const reduce = require('lodash/reduce');
const uniq = require('lodash/uniq');

const logger = require('../../helpers/logger');
const { territoryGraph } = require('../../../data/gameterritorylist.json');


module.exports = {
  getTerritoryWithMostArmies,
  getCanAttackTerritoryList,
  getCanAttack,
  getTerritoryList
};

function getTerritoryList() {
  return Object.keys(territoryGraph);
}

/**
 * Using the reference finds the territory with the most armies
 * If two have the same number of armies it doesn't differetiate
 * Just grabs the one appearing later in the reduce
 * @param {Array<string>} territoryList to check
 * @param {Object} territories reference
 * @returns {String} id of territory with most armies
 */
function getTerritoryWithMostArmies(territoryList, territories) {
  logger.debug('getTerritoryWithMostArmies');
  return reduce(
    territoryList,
    (resultID, territoryID) => {
      const nextTerritory = territories[territoryID];
      const currentTerritory = resultID && territories[resultID];
      const currentResultHasMoreArmies = currentTerritory
        && currentTerritory.armies > nextTerritory.armies;

      return !currentResultHasMoreArmies ? territoryID : resultID;
    }, null
  );
}

/**
 * Uses the territoryGraph to:
 * - create a list of territories that can attack the enemyTerritories provided
 * @param {Array<string>} enemyTerritories
 * @returns {Array<string>}
 */
function getCanAttackTerritoryList(enemyTerritories) {
  return reduce(
    enemyTerritories,
    (result, territoryID) => uniq([
      ...result,
      ...getCanAttack(territoryID)
    ]), []
  );
}

/**
 * Returns list of territories that can attack
 * the territory with ID supplied
 * @param {String} territoryID
 * @returns {Array<string>}
 */
function getCanAttack(territoryID) {
  return territoryGraph[territoryID];
}
