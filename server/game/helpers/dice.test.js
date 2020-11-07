const { expect } = require('chai');
const sinon = require('sinon');
const dice = require('./dice');

describe('How Dice determine the result of conflict', () => {
  it('They Roll a number between one and six', () => {
    const diceResult = dice.diceRoll();
    expect(diceResult).to.be.within(1, 6);
  });

  describe('When the dice yield 1, 4, 3, 5, 3, 5, 4, 2, 3 in order', () => {
    beforeEach(() => {
      const stubbedRoll = sinon.stub(dice, 'diceRoll');
      stubbedRoll.onCall(0)
        .returns(1);
      stubbedRoll.onCall(1)
        .returns(4);
      stubbedRoll.onCall(2)
        .returns(3);
      stubbedRoll.onCall(3)
        .returns(5);
      stubbedRoll.onCall(4)
        .returns(4);
      stubbedRoll.onCall(5)
        .returns(2);
      stubbedRoll.onCall(6)
        .returns(3);
    });

    afterEach(() => {
      dice.diceRoll.restore();
    });

    it('A sorted array of results are returned when rolled 3 times', () => {
      const sortedRolls = dice.sortedDiceRollsForPlayer(3);
      const expected = [4, 3, 1];
      expect(sortedRolls).to.deep.equal(expected);
    });

    it('A sorted array of results are returned when rolled 4 times', () => {
      const sortedRolls = dice.sortedDiceRollsForPlayer(4);
      const expected = [5, 4, 3, 1];
      expect(sortedRolls).to.deep.equal(expected);
    });
  });

  describe('The number dice an attacker is allowed to use', () => {
    it('Is never allowed to be more than three', () => {
      const numDice = dice.getNumAttackingDice(4);
      expect(numDice).to.equal(3);
    });

    it('Is zero when one army is left in the territory', () => {
      const numDice = dice.getNumAttackingDice(1);
      expect(numDice).to.equal(0);
    });
  });

  describe('The number dice an defender is allowed to use', () => {
    it('Is never allowed to be more than two', () => {
      const numDice = dice.getNumDefendingDice(4);
      expect(numDice).to.equal(2);
    });

    it('Is down to the last man, when one army is left in a territory, that one can defend', () => {
      const numDice = dice.getNumDefendingDice(1);
      expect(numDice).to.equal(1);
    });
  });

  describe('When territories are at war', () => {
    describe('With 5 attackers and 3 defenders', () => {
      let warConfig = {};
      beforeEach(() => {
        warConfig = {
          attackingTerritory: { armies: 5 },
          defendingTerritory: { armies: 3 }
        };
      });

      it('The total number of armies lost is equal to the number of dice the defender rolls', () => {
        const { isDefenderBased } = dice.territoryDiceRoll(warConfig);
        expect(isDefenderBased).to.equal(true);
      });

      describe('When the attacker rolls 3,2,1 and defender rolls 3,2', () => {
        beforeEach(() => {
          const stubbedResult = sinon.stub(dice, 'sortedDiceRollsForPlayer');
          stubbedResult.onCall(0).returns([3, 2, 1]); // attacker
          stubbedResult.onCall(1).returns([3, 2]); // defender
        });

        afterEach(() => {
          dice.sortedDiceRollsForPlayer.restore();
        });

        it('the attacker loses two armies', () => {
          const { winners } = dice.territoryDiceRoll(warConfig);
          expect(winners).to.deep.equal([
            true,
            true
          ]);
        });
      });

      describe('When the attacker rolls 2,2,1 and defender rolls 2,1', () => {
        beforeEach(() => {
          const stubbedResult = sinon.stub(dice, 'sortedDiceRollsForPlayer');
          stubbedResult.onCall(0).returns([2, 2, 1]); // attacker
          stubbedResult.onCall(1).returns([2, 1]); // defender
        });

        afterEach(() => {
          dice.sortedDiceRollsForPlayer.restore();
        });

        it('Each player loses an army', () => {
          const { winners } = dice.territoryDiceRoll(warConfig);
          expect(winners).to.deep.equal([
            true,
            false
          ]);
        });
      });

      describe('When the attacker rolls 2,2,1 and defender rolls 1,1', () => {
        beforeEach(() => {
          const stubbedResult = sinon.stub(dice, 'sortedDiceRollsForPlayer');
          stubbedResult.onCall(0).returns([2, 2, 1]); // attacker
          stubbedResult.onCall(1).returns([1, 1]); // defender
        });

        afterEach(() => {
          dice.sortedDiceRollsForPlayer.restore();
        });

        it('The defender loses two armies', () => {
          const { winners } = dice.territoryDiceRoll(warConfig);
          expect(winners).to.deep.equal([
            false,
            false
          ]);
        });
      });
    });

    describe('With 2 attackers and 2 defenders', () => {
      let warConfig = {};
      beforeEach(() => {
        warConfig = {
          attackingTerritory: { armies: 2 },
          defendingTerritory: { armies: 2 }
        };
      });

      it('The total number of armies lost is equal to the number of dice the attacker rolls', () => {
        const { isDefenderBased } = dice.territoryDiceRoll(warConfig);
        expect(isDefenderBased).to.equal(false);
      });

      describe('When the attacker rolls a 2 and defender rolls 1,1', () => {
        beforeEach(() => {
          const stubbedResult = sinon.stub(dice, 'sortedDiceRollsForPlayer');
          stubbedResult.onCall(0).returns([2]); // attacker
          stubbedResult.onCall(1).returns([1, 1]); // defender
        });

        afterEach(() => {
          dice.sortedDiceRollsForPlayer.restore();
        });

        it('The defender loses one army', () => {
          const { winners } = dice.territoryDiceRoll(warConfig);
          expect(winners).to.deep.equal([
            true
          ]);
        });
      });
    });
  });
});
