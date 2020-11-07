const MAX_ATTACKER_DICE = 3;
const MAX_DEFENDER_DICE = 2;

const diceRoll = () => Math.floor(Math.random() * 6) + 1;
const getNumAttackingDice = armies => Math.min(armies - 1, MAX_ATTACKER_DICE);
const getNumDefendingDice = armies => Math.min(armies, MAX_DEFENDER_DICE);
const getIsDefenderBased = (numAttackers, numDefenders) => Math.min(
  numAttackers,
  numDefenders
) === numDefenders;

// placing diceRoll here and
// calling diceRoll in sortedDiceRollsForPlayer
// makes it possible to stub diceRoll
const publicMethods = {
  territoryDiceRoll,
  sortedDiceRollsForPlayer,
  diceRoll,
  getNumAttackingDice,
  getNumDefendingDice
};

/**
 * Sets number of dice rolls for attacker and defender
 * Rolls that many dice for each player
 * Takes the sorted result and creates an array of booleans for winning an loosing
 * @param {object} territoriesAtWar
 * @returns {object}
 */
function territoryDiceRoll({ attackingTerritory, defendingTerritory }) {
  const numAttackingDice = getNumAttackingDice(attackingTerritory.armies);
  const numDefendingDice = getNumDefendingDice(defendingTerritory.armies);
  const attackingTerritoryDiceRolls = publicMethods.sortedDiceRollsForPlayer(numAttackingDice);
  const defendingTerritoryDiceRolls = publicMethods.sortedDiceRollsForPlayer(numDefendingDice);

  const isDefenderBased = getIsDefenderBased(
    attackingTerritoryDiceRolls.length,
    defendingTerritoryDiceRolls.length
  );

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
  return [...rollArray].map(publicMethods.diceRoll).sort(descending);
}

module.exports = publicMethods;
