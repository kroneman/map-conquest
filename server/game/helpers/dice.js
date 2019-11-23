const MAX_DICE = 3;
const diceRoll = () => Math.floor(Math.random() * 6) + 1;

module.exports = {
  territoryDiceRoll,
  sortedDiceRollsForPlayer,
  diceRoll
};

/**
 * Sets number of dice rolls for attacker and defender
 * Rolls that many dice for each player
 * Takes the sorted result and creates an array of booleans for winning an loosing
 * @param {object} territoriesAtWar
 * @returns {object}
 */
function territoryDiceRoll({ attackingTerritory, defendingTerritory }) {
  const numAttackingDice = (attackingTerritory.armies - 1) >= MAX_DICE
    ? MAX_DICE : (attackingTerritory.armies - 1);
  const numDefendingDice = defendingTerritory.armies >= (MAX_DICE - 1)
    ? (MAX_DICE - 1) : defendingTerritory.armies;

  const attackingTerritoryDiceRolls = sortedDiceRollsForPlayer(numAttackingDice);
  const defendingTerritoryDiceRolls = sortedDiceRollsForPlayer(numDefendingDice);

  const isDefenderBased = Math.min(
    attackingTerritoryDiceRolls.length,
    defendingTerritoryDiceRolls.length
  ) === defendingTerritoryDiceRolls.length;
  const usedLessDice = isDefenderBased
    ? defendingTerritoryDiceRolls : attackingTerritoryDiceRolls;

  // Use the player that rolled less dice, since that determines how many armies are lost
  const winners = usedLessDice.map((value, index) => {
    if (isDefenderBased) {
      return value >= attackingTerritoryDiceRolls[index];
    }

    return value > defendingTerritoryDiceRolls[index];
  });

  return {
    isDefenderBased,
    winners,
    attackingTerritoryDiceRolls,
    defendingTerritoryDiceRolls
  };
}

/**
 * have to spread the empty array to get indexes
 * https://itnext.io/heres-why-mapping-a-constructed-array-doesn-t-work-in-javascript-f1195138615a
 * @param {number} numDice to roll
 * @returns {array<number>} array of dice roll results sorted from highest to lowest
 */
function sortedDiceRollsForPlayer(numDice) {
  const descending = (a, b) => b - a;
  const rollArray = [];
  rollArray.length = numDice;
  return [...rollArray].map(diceRoll).sort(descending);
}
