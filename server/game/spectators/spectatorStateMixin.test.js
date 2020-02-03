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

describe('Server Spectator State Mixin', () => {
  it('StateInstance.addSpectator():', () => {
    StateInstance.removeAllSpectators();

    StateInstance.addSpectator(createDummySpectator());
    expect(StateInstance.spectators).to.deep.include(
      createDummySpectator()
    );
  });

  it('StateInstance.removeSpectator():', () => {
    StateInstance.removeAllSpectators();

    StateInstance.addSpectator(createDummySpectator({
      id: 'uniqueOne'
    }));
    StateInstance.addSpectator(createDummySpectator({
      id: 'uniqueTwo'
    }));
    StateInstance.addSpectator(createDummySpectator());
    StateInstance.removeSpectator({
      id: 'uniqueTwo'
    });
    expect(StateInstance.spectators).to.deep.include(
      createDummySpectator({
        id: 'uniqueOne'
      })
    );
  });

  it('StateInstance.getSpectator():', () => {
    StateInstance.removeAllSpectators();
    const spectator = createDummySpectator({
      id: 'getSpectatorID'
    });

    StateInstance.addSpectator(spectator);

    const retrievedSpectator = StateInstance.getSpectator('getSpectatorID');
    expect(retrievedSpectator).to.deep.equal(spectator);
  });

  it('StateInstance.isSpectator():', () => {
    StateInstance.removeAllSpectators();
    const spectator = createDummySpectator({
      id: 'isSpectatorID'
    });

    StateInstance.addSpectator(spectator);

    const isSpectator = StateInstance.isSpectator(spectator.id);
    expect(isSpectator).to.deep.equal(true);
  });
});
