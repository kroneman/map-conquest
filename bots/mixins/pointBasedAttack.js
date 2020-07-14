const intersection = require('lodash/intersection');
const has = require('lodash/has');
const sample = require('lodash/sample');

const { territoryGraph } = require('../../data/gameterritorylist.json');
const logger = require('../helpers/logger');

const MIN_ATTACK_FROM_ARMIES = 3;

const { validateIfTurnCanProceed } = require('./lib/validation');
const { getTerritoryWithMostArmies } = require('./lib/territory');
const {
  selectContinentToAttack,
  getAttackFromList,
  getStatusByContinent,
  getContinentIOwnLeastOf
} = require('./lib/continent');

module.exports = SuperClass => class extends SuperClass {
  /**
   * Overrides default BaseBot turnReinforcements
   * Therefore logging PointBasedAttack for clarification
   * @param {Object} gameDetails instance state of current game
   */
  turnReinforcements({ territoryMap, territories }, { reinforcements }) {
    logger.debug(`PointBasedAttack: turnReinforcements: ${reinforcements}`);
    const allTerritories = Object.keys(territories);
    const allMyTerritories = territoryMap[this.botPlayerID];
    const isProceed = validateIfTurnCanProceed(allTerritories, allMyTerritories);
    if (!isProceed) {
      return;
    }

    const continentStatus = getStatusByContinent(allMyTerritories);
    const continentIOwnLeastOf = getContinentIOwnLeastOf(continentStatus);
    const continentIOwnMostOf = selectContinentToAttack(allMyTerritories);
    const continentToAttack = continentIOwnLeastOf.percentage > 0
      ? continentIOwnMostOf : continentIOwnLeastOf;
    const attackFromList = getAttackFromList(continentToAttack, allMyTerritories);

    const territoryListToReinforce = attackFromList.length ? attackFromList : allMyTerritories;
    const selectedTerritory = sample(territoryListToReinforce);

    logger.info(`Reinforcing: ${selectedTerritory}`);
    this.emitSelectTerritory(selectedTerritory);
  }

  /**
   * Overrides default BaseBot turnAttack
   * Therefore logging PointBasedAttack for clarification
   * @param {Object} gameDetails instance state of current game
   */
  turnAttack({ territories, territoryMap }) {
    logger.debug('PointBasedAttack: turnAttack');
    const allTerritories = Object.keys(territories);
    const allMyTerritories = territoryMap[this.botPlayerID];
    const isProceed = validateIfTurnCanProceed(allTerritories, allMyTerritories);
    if (!isProceed) {
      return;
    }

    const continentStatus = getStatusByContinent(allMyTerritories);
    const continentIOwnLeastOf = getContinentIOwnLeastOf(continentStatus);
    const continentIOwnMostOf = selectContinentToAttack(allMyTerritories);
    const continentToAttack = continentIOwnLeastOf.percentage > 0
      ? continentIOwnMostOf : continentIOwnLeastOf;
    const attackFromList = getAttackFromList(continentToAttack, allMyTerritories);

    const attackerID = getTerritoryWithMostArmies(attackFromList, territories);
    const attackFromEdges = territoryGraph[attackerID];
    const shouldAttackList = intersection(attackFromEdges, continentToAttack.enemyTerritories);
    const attackFromTerritory = has(territories, attackerID) && territories[attackerID];
    const attackFromArmies = attackFromTerritory ? attackFromTerritory.armies : 0;

    const isCanAttack = shouldAttackList.length > 0 && attackFromArmies >= MIN_ATTACK_FROM_ARMIES;
    if (!isCanAttack) {
      this.emitTurnEnd();
      return;
    }

    const attackConfig = {
      attackerID,
      defenderID: sample(shouldAttackList)
    };
    logger.info('Attacking %s from %s', attackConfig.defenderID, attackConfig.attackerID);
    this.emitAttackTerritory(attackConfig);
  }
};
