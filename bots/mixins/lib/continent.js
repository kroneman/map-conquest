const reduce = require('lodash/reduce');
const difference = require('lodash/difference');
const intersection = require('lodash/intersection');
const has = require('lodash/has');
const map = require('lodash/map');

const territoryListByContinent = require('../../../data/gameterritorylist.json').continents;
const { getCanAttackTerritoryList, getCanAttack, getTerritoryList } = require('./territory');

const continentList = Object.keys(territoryListByContinent);

/**
 * Library to Help bots understand continents in the game
 * @dependsOn ./territory
 */
module.exports = {
  selectContinentToAttack,
  getStatusByContinent,
  getAttackFromList,
  getChokePointTerritories,
  getContinentIOwnLeastOf
};

/**
 * @typedef continentStatus
 * @param {Number} percentage of continent i own
 * @param {Array<string>} myTerritories
 * @param {Array<string>} enemyTerritories
 */

/**
 * Retrieves continent status that the players owns most of but not completely
 * @param {Array} allMyTerritories
 * @returns {continentStatus}
 */
function selectContinentToAttack(allMyTerritories) {
  const statusByContinent = getStatusByContinent(allMyTerritories);
  const continentIOwnMostOf = getContinentIOwnMostOf(statusByContinent);

  return continentIOwnMostOf;
}

/**
 * Gets a status report per continent
 * @param {Array<string>} allMyTerritories
 * @returns {
 *  [string]: continentStatus
 * }
 */
function getStatusByContinent(allMyTerritories) {
  const continentPercentages = {};
  let lenContinentList = continentList.length;

  while (lenContinentList) {
    lenContinentList -= 1;
    const currentContinentKey = continentList[lenContinentList];
    const currentContinentTerritories = territoryListByContinent[currentContinentKey];
    const myTerritories = intersection(currentContinentTerritories, allMyTerritories);
    const enemyTerritories = difference(currentContinentTerritories, myTerritories);
    const percentage = myTerritories.length / currentContinentTerritories.length;
    // don't include continents completely owned by me
    if (percentage < 1) {
      continentPercentages[currentContinentKey] = {
        percentage,
        enemyTerritories,
        myTerritories
      };
    }
  }

  return continentPercentages;
}

/**
 * Returns that status of the continent I don't completely own
 * But have the highest stake in based on percentage
 * @param {Object} continentPercentages
 * @returns {continentStatus}
 */
function getContinentIOwnMostOf(continentPercentages) {
  const continentStatusList = Object.keys(continentPercentages);
  const idOfContinent = reduce(continentStatusList, (result, continent) => {
    if (!has(continentPercentages, result)) {
      return continent;
    }

    const current = continentPercentages[result].percentage;
    const next = continentPercentages[continent].percentage;
    return current < next ? continent : result;
  }, '');
  return continentPercentages[idOfContinent];
}

/**
 * @param {Object} continentPercentages
 * @returns {Object} continent with lowest ownership
 */
function getContinentIOwnLeastOf(continentPercentages) {
  const continentStatusList = Object.keys(continentPercentages);
  const idOfContinent = reduce(continentStatusList, (result, continent) => {
    if (!has(continentPercentages, result)) {
      return continent;
    }

    const current = continentPercentages[result].percentage;
    const next = continentPercentages[continent].percentage;
    return current > next ? continent : result;
  }, '');
  return continentPercentages[idOfContinent];
}

/**
 * Retrieves a list of territories that
 * are able to attack enemy territories on selected continent
 * By comparing a list of all the players territories to those that can reach
 * territories not owned on the continent
 * @param {continentStatus} continentToAttack
 * @param {Array<string>} allMyTerritories
 * @returns {Array<string>}
 */
function getAttackFromList(continentToAttack, allMyTerritories) {
  const { myTerritories, enemyTerritories } = continentToAttack;
  const iOwnTerritoryOnContinent = myTerritories.length > 0;
  const canAttackEnemyTerritoriesOnContinent = getCanAttackTerritoryList(enemyTerritories);
  const candidateAttackFromList = iOwnTerritoryOnContinent ? myTerritories : allMyTerritories;
  const attackFromList = intersection(
    candidateAttackFromList,
    canAttackEnemyTerritoriesOnContinent
  );

  return attackFromList;
}

/**
 * Gets a list of territories that can be attacked from another continent
 * @returns {Array<Object>}
 */
function getChokePointTerritories() {
  const territoryList = getTerritoryList();
  const withChokePointList = map(territoryList, (territoryID) => {
    const territoryContinent = getContinentOfTerritory(territoryID);
    const canAttackThisTerritory = getCanAttack(territoryID);
    return {
      id: territoryID,
      isChokePoint: canAttackThisTerritory.some(
        adjacentTerritoryID => getContinentOfTerritory(adjacentTerritoryID) !== territoryContinent
      )
    };
  });

  return withChokePointList.filter(item => item.isChokePoint);
}

/**
 * @param {String} territoryID
 * @returns {String} continent the territory is on
 */
function getContinentOfTerritory(territoryID) {
  return reduce(
    continentList,
    (result, continentID) => territoryListByContinent[continentID].includes(territoryID), ''
  );
}
