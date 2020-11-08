const sinon = require('sinon');
const { expect } = require('chai');
const ReinforcementsStateMixin = require('./reinforcementsStateMixin');

const State = ReinforcementsStateMixin(class BaseState {
  /* eslint-disable class-methods-use-this */
  getPlayerTerritories() {
    return [];
  }

  checkContinentOwnership() {
    return [];
  }
  /* eslint-enable class-methods-use-this */
});
const StateInstance = new State();

describe('ReinforcementsStateMixin', () => {
  describe('calculatePlayerReinforcements', () => {
    afterEach(() => {
      StateInstance.getPlayerTerritories.restore();
    });

    it('Gives 1 reinforcement when a player has three territories', () => {
      const player = {
        id: 'player_id'
      };

      const getPlayerTerritoriesStub = sinon.stub(StateInstance, 'getPlayerTerritories');
      getPlayerTerritoriesStub.withArgs(player.id).returns([1, 2, 3]);

      const reinforcements = StateInstance.calculatePlayerReinforcements(player);
      expect(reinforcements).to.equal(1);
    });

    it('Gives 1 reinforcement when a player has five territories', () => {
      const player = {
        id: 'player_id'
      };

      const getPlayerTerritoriesStub = sinon.stub(StateInstance, 'getPlayerTerritories');
      getPlayerTerritoriesStub.withArgs(player.id).returns([1, 2, 3, 4, 5]);

      const reinforcements = StateInstance.calculatePlayerReinforcements(player);
      expect(reinforcements).to.equal(1);
    });

    it('Gives 2 reinforcement when a player has six territories', () => {
      const player = {
        id: 'player_id'
      };

      const getPlayerTerritoriesStub = sinon.stub(StateInstance, 'getPlayerTerritories');
      getPlayerTerritoriesStub.withArgs(player.id).returns([1, 2, 3, 4, 5, 6]);

      const reinforcements = StateInstance.calculatePlayerReinforcements(player);
      expect(reinforcements).to.equal(2);
    });

    describe('When a player has 15 territories', () => {
      it('They Should receive 5 reinforcements', () => {
        const player = {
          id: 'player_id'
        };

        const getPlayerTerritoriesStub = sinon.stub(StateInstance, 'getPlayerTerritories');
        getPlayerTerritoriesStub.withArgs(player.id).returns([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
        ]);

        const reinforcements = StateInstance.calculatePlayerReinforcements(player);
        expect(reinforcements).to.equal(5);
      });

      it('Should receive additional reinforcements for owning a continent', () => {
        const player = {
          id: 'player_id'
        };

        const getPlayerTerritoriesStub = sinon.stub(StateInstance, 'getPlayerTerritories');
        getPlayerTerritoriesStub.withArgs(player.id).returns([
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
        ]);
        const checkContinentOwnershipStub = sinon.stub(StateInstance, 'checkContinentOwnership');
        checkContinentOwnershipStub.withArgs(player).returns(['africa']);

        const reinforcements = StateInstance.calculatePlayerReinforcements(player);
        expect(reinforcements).to.equal(8);
      });
    });
  });

  describe('calculateStartingReinforcements', () => {
    it('Should be divided among the number of starting players', () => {
      StateInstance.players = [{}, {}];
      const startingReinforcements = StateInstance.calculateStartingReinforcements();
      expect(startingReinforcements).to.equal(40);
    });
  });

  describe('setPlayerReinforcements', () => {
    it('Should update the number of reinforcements a player has', () => {
      const player = {
        id: 'player_one',
        reinforcements: 20
      };
      StateInstance.players = [player];

      StateInstance.setPlayerReinforcements({
        player,
        numReinforcements: 4
      });

      expect(player.reinforcements).to.equal(24);
    });
  });

  describe('setStartingReinforcements', () => {
    it('Should divide starting reinforcements equally among players', () => {
      const playerOne = { id: 'player_one' };
      const playerTwo = { id: 'player_two' };
      StateInstance.players = [playerOne, playerTwo];

      StateInstance.setStartingReinforcements();

      expect(StateInstance.players).to.deep.equal([
        { ...playerOne, reinforcements: 40 },
        { ...playerTwo, reinforcements: 40 }
      ]);
    });
  });
});
