const logger = require('../../helpers/logger');


module.exports = {
  validateIfTurnCanProceed
};

/**
 * @param {Array} allMyTerritories currently owned by me in game
 * @param {Array} allTerritories in game
 * @returns {Boolean}
 */
function validateIfTurnCanProceed(allMyTerritories, allTerritories) {
  if (iHaveWon(allMyTerritories, allTerritories)) {
    logger.info(`${this.botProperties.name} has Won!`);
    process.exit(0);
    return false;
  }

  if (iHaveLost(allMyTerritories)) {
    logger.info(`${this.botProperties.name} has Lost!`);
    process.exit(1);
    return false;
  }

  return true;
}

/**
 * @param {Array<string>} allMyTerritories
 * @param {Array<string>} allTerritories
 * @returns {Boolean}
 */
function iHaveWon(allMyTerritories, allTerritories) {
  return allMyTerritories.length === allTerritories.length;
}

/**
 * @param {Array<string>} allMyTerritories
 * @returns {Boolean}
 */
function iHaveLost(allMyTerritories) {
  return allMyTerritories.length === 0;
}
