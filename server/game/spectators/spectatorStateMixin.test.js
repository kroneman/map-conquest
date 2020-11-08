const { expect } = require('chai');
const SpectatorsStateMixin = require('./spectatorsStateMixin');

const State = SpectatorsStateMixin(class StateExtendedWithSpectator {});
const StateInstance = new State();

// Utility to create dummy players for tests
const createDummySpectator = config => ({
  id: 'randomInvalidID',
  name: 'Dummy Player',
  color: '#fff',
  ...config
});

describe('spectatorStateMixin', () => {
  afterEach(() => {
    StateInstance.removeAllSpectators();
  });

  describe('hasSpectators', () => {
    it('Should return false if the game has no spectators', () => {
      expect(StateInstance.hasSpectators).to.equal(false);
    });

    it('Should return true once the game has spectators', () => {
      const spectator = createDummySpectator({ id: 'spectator_one' });
      StateInstance.addSpectator(spectator);

      expect(StateInstance.hasSpectators).to.equal(true);
    });
  });

  describe('addSpectator(player)', () => {
    it('Should add a spectator', () => {
      const spectator = createDummySpectator({ id: 'spectator_one' });

      const result = StateInstance.addSpectator(spectator);

      expect(result).to.equal(true);
      expect(StateInstance.spectators).to.deep.include(spectator);
    });

    it('Should not add a spectator with a duplicate id', () => {
      const spectatorOne = createDummySpectator({ id: 'spectator_one' });
      const spectatorTwo = createDummySpectator({ id: 'spectator_one', someProperty: 'test' });

      const resultOne = StateInstance.addSpectator(spectatorOne);
      const resultTwo = StateInstance.addSpectator(spectatorTwo);

      expect(resultOne).to.equal(true);
      expect(resultTwo).to.equal(false);
      expect(StateInstance).to.deep.equal({
        spectators: [spectatorOne]
      });
    });
  });

  describe('removeSpectator(player)', () => {
    it('Should not remove a spectator that doesn\'t exist', () => {
      const nonExistentSpectator = createDummySpectator({
        id: 'uniqueOne'
      });

      StateInstance.removeSpectator({
        id: nonExistentSpectator.id
      });
    });

    it('Should only remove the spectator with the id passed as an argument', () => {
      StateInstance.addSpectator(createDummySpectator({
        id: 'unique_One'
      }));
      StateInstance.addSpectator(createDummySpectator({
        id: 'unique_two'
      }));
      StateInstance.removeSpectator({
        id: 'unique_two'
      });
      expect(StateInstance.spectators).to.deep.equal([
        createDummySpectator({
          id: 'unique_One'
        })
      ]);
    });
  });

  describe('getSpectator(id)', () => {
    it('Should return a spectator by id', () => {
      const spectator = createDummySpectator({
        id: 'getSpectatorID'
      });

      StateInstance.addSpectator(spectator);

      const retrievedSpectator = StateInstance.getSpectator('getSpectatorID');
      expect(retrievedSpectator).to.deep.equal(spectator);
    });

    it('Should return when a spectator with the given id is not found', () => {
      const spectator = createDummySpectator({
        id: 'getSpectatorID'
      });

      StateInstance.addSpectator(spectator);

      const retrievedSpectator = StateInstance.getSpectator('getSpectator_no_id');
      expect(retrievedSpectator).to.deep.equal(null);
    });
  });

  describe('isSpectator(id)', () => {
    it('Should return true if the game has a spectator with the given id', () => {
      const spectator = createDummySpectator({
        id: 'isSpectatorID'
      });

      StateInstance.addSpectator(spectator);

      const isSpectator = StateInstance.isSpectator(spectator.id);
      expect(isSpectator).to.deep.equal(true);
    });

    it('Should return false if the game does not have a spectator with the given id', () => {
      const isSpectator = StateInstance.isSpectator('spectator.id');
      expect(isSpectator).to.deep.equal(false);
    });
  });
});
