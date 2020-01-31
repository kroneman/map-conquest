const { expect } = require('chai');
const PlayerStateMixin = require('./playersStateMixin');

const State = PlayerStateMixin(class StateExtendedWithPlayer {});
const StateInstance = new State();


// Utility to create dummy players for tests
const createDummyPlayer = config => ({
  id: 'randomInvalidID',
  name: 'Dummy Player',
  color: '#fff',
  // Todo: Refactor to not add reinforcements right away when adding a player to the game
  reinforcements: 40,
  ...config
});

describe('Server Player State Mixin', () => {
  /**
   * Starting Test Assumptions
   */
  it('Test assumption: It has a player Turn Index', () => {
    expect(StateInstance).to.deep.include({ playerTurnIndex: 0 });
  });

  /**
   * Add / Remove / Get Player
   */
  it('StateInstance.addPlayer(playerInfo): Should add a player to the state', () => {
    expect(StateInstance).to.deep.include({ players: [] });
    const playerInfo = createDummyPlayer();
    StateInstance.addPlayer(playerInfo);
    expect(StateInstance).to.deep.include({ players: [playerInfo] });
  });

  it('StateInstance.addPlayer(playerInfo): Should not be able to add a player with the same ID as an existing player', () => {
    const returnedTrue = StateInstance.addPlayer(createDummyPlayer({ id: 'duplicateID' }));
    expect(returnedTrue).to.equal(true);
    const returnedFalse = StateInstance.addPlayer(createDummyPlayer({ id: 'duplicateID' }));
    expect(returnedFalse).to.equal(false);

    expect(StateInstance).to.deep.include({
      players: [
        createDummyPlayer(),
        createDummyPlayer({ id: 'duplicateID' })
      ]
    });
  });

  it('StateInstance.removePlayer(player): Should remove a player from state', () => {
    StateInstance.removePlayer({ id: 'duplicateID' });
    expect(StateInstance).to.deep.include({
      players: [
        createDummyPlayer()
      ]
    });
  });

  it('StateInstance.getPlayer(playerID): Should retrieve a player by id from the list', () => {
    // expect a certain starting state for this test
    expect(StateInstance).to.deep.include({
      players: [
        createDummyPlayer()
      ]
    });

    const retrievedPlayer = StateInstance.getPlayer('randomInvalidID');
    expect(retrievedPlayer).to.deep.equal(createDummyPlayer());
  });
});
