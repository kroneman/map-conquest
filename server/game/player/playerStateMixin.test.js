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
  it('StateInstance.removeInactivePlayers():', () => {
    expect(StateInstance).to.deep.include({ players: [] });

    StateInstance.addPlayer(createDummyPlayer({ id: 'one' }));
    StateInstance.addPlayer(createDummyPlayer({ id: 'two' }));
    StateInstance.addPlayer(createDummyPlayer({ id: 'three' }));
    StateInstance.addPlayer(createDummyPlayer({ id: 'four' }));

    StateInstance.removeInactivePlayers([
      'two', 'four'
    ]);

    expect(StateInstance).to.deep.include({
      players: [
        createDummyPlayer({ id: 'two' }),
        createDummyPlayer({ id: 'four' })
      ]
    });
  });

  it('StateInstance.addPlayer():', () => {
    StateInstance.removeInactivePlayers([]);

    const playerInfo = createDummyPlayer();
    StateInstance.addPlayer(playerInfo);

    expect(StateInstance).to.deep.include({ players: [playerInfo] });
  });


  it('StateInstance.addPlayer():', () => {
    StateInstance.removeInactivePlayers([]);

    const duplicatePlayer = createDummyPlayer({ id: 'duplicateID' });
    const returnedTrue = StateInstance.addPlayer(duplicatePlayer);
    const returnedFalse = StateInstance.addPlayer(duplicatePlayer);

    // if adding is successful return true, if unsuccessfull return false
    expect(returnedTrue).to.equal(true);
    expect(returnedFalse).to.equal(false);
    expect(StateInstance).to.deep.include({
      players: [
        createDummyPlayer({ id: 'duplicateID' })
      ]
    });
  });

  it('StateInstance.removePlayer():', () => {
    StateInstance.removeInactivePlayers([]);

    StateInstance.addPlayer(createDummyPlayer({ id: 'duplicateID' }));
    StateInstance.removePlayer({ id: 'duplicateID' });

    expect(StateInstance).to.deep.include({
      players: []
    });
  });

  it('StateInstance.getPlayer():', () => {
    StateInstance.removeInactivePlayers([]);
    const playerToCreateThenRetrieve = createDummyPlayer({ id: 'retrievedPlayerID' });

    StateInstance.addPlayer(playerToCreateThenRetrieve);
    const retrievedPlayer = StateInstance.getPlayer('retrievedPlayerID');

    expect(retrievedPlayer).to.deep.equal(playerToCreateThenRetrieve);
  });

  it('StateInstance.updatePlayer():', () => {
    StateInstance.removeInactivePlayers([]);

    StateInstance.addPlayer(createDummyPlayer({ id: 'playerToUpdate' }));
    StateInstance.updatePlayer('playerToUpdate', { nonExistingAttribute: '' });

    const player = StateInstance.getPlayer('playerToUpdate');
    expect(player).to.deep.include({ nonExistingAttribute: '' });
  });

  it('StateInstance.isPlayer():', () => {
    StateInstance.removeInactivePlayers([]);

    const isPlayer = StateInstance.isPlayer('nonExistentPlayer');
    expect(isPlayer).to.equal(false);

    StateInstance.addPlayer(createDummyPlayer({ id: 'nonExistentPlayer' }));

    const isNowAPlayer = StateInstance.isPlayer('nonExistentPlayer');
    expect(isNowAPlayer).to.equal(true);
  });

  it('StateInstance.playerTurn:', () => {
    StateInstance.removeInactivePlayers([]);
    expect(StateInstance.playerTurn).to.equal(null);

    const playerWhosTurnItIs = createDummyPlayer({ id: 'playerWhosTurnItIs' });

    StateInstance.addPlayer(playerWhosTurnItIs);
    StateInstance.addPlayer(createDummyPlayer({ id: 'nextPlayer' }));

    expect(StateInstance.playerTurn).to.deep.equal(playerWhosTurnItIs);
  });

  it('StateInstance.updatePlayersTurn():', () => {
    StateInstance.removeInactivePlayers([]);

    const firstPlayer = createDummyPlayer({ id: 'firstPlayer' });
    const secondPlayer = createDummyPlayer({ id: 'secondPlayer' });
    const thirdPlayer = createDummyPlayer({ id: 'thirdPlayer' });

    StateInstance.addPlayer(firstPlayer);
    StateInstance.addPlayer(secondPlayer);
    StateInstance.addPlayer(thirdPlayer);

    expect(StateInstance.playerTurn).to.deep.equal(firstPlayer);
    StateInstance.updatePlayersTurn();
    expect(StateInstance.playerTurn).to.deep.equal(secondPlayer);
    StateInstance.updatePlayersTurn();
    expect(StateInstance.playerTurn).to.deep.equal(thirdPlayer);
    StateInstance.updatePlayersTurn();
    expect(StateInstance.playerTurn).to.deep.equal(firstPlayer);
  });

  it('StateInstance.colorOptions: update based on colors taken by players', () => {
    StateInstance.removeInactivePlayers([]);

    const originalColorOptions = [...StateInstance.colorOptions];
    const firstPlayer = createDummyPlayer({
      id: 'colorOptions',
      color: originalColorOptions[0]
    });

    StateInstance.addPlayer(firstPlayer);

    const updatedColor = originalColorOptions.filter(colors => colors !== originalColorOptions[0]);
    expect(StateInstance.colorOptions).to.deep.equal(updatedColor);

    StateInstance.removePlayer(firstPlayer);
    expect(StateInstance.colorOptions).to.deep.equal(originalColorOptions);
  });
});
