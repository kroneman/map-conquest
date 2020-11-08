const sinon = require('sinon');
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

describe('playerState', () => {
  before(() => {
    sinon.stub(console, 'warn');
  });

  after(() => {
    // eslint-disable-next-line no-console
    console.warn.restore();
  });

  describe('playerTurn', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should be null when there are no players', () => {
      expect(StateInstance.playerTurn).to.equal(null);
    });

    it('Should be the player when the player is added', () => {
      StateInstance.addPlayer(createDummyPlayer({ id: 'duplicateID' }));
      expect(StateInstance.playerTurn).to.deep.equal(
        createDummyPlayer({ id: 'duplicateID' })
      );
    });
  });

  describe('hasPlayers', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should return false when no players are in state', () => {
      expect(StateInstance.hasPlayers).to.equal(false);
    });

    it('Should return true when a player is added to state', () => {
      StateInstance.addPlayer(createDummyPlayer({ id: 'nonExistentPlayer' }));
      expect(StateInstance.hasPlayers).to.equal(true);
    });
  });

  describe('isPlayer(id)', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should return false when non-existent player id is checked', () => {
      const isPlayer = StateInstance.isPlayer('nonExistentPlayer');
      expect(isPlayer).to.equal(false);
    });

    it('Should return true when existing playerID is checked', () => {
      StateInstance.addPlayer(createDummyPlayer({ id: 'nonExistentPlayer' }));

      const isNowAPlayer = StateInstance.isPlayer('nonExistentPlayer');
      expect(isNowAPlayer).to.equal(true);
    });
  });

  describe('addPlayer(player)', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should be able to add a player to state', () => {
      StateInstance.addPlayer(createDummyPlayer({ id: 'two' }));
      expect(StateInstance).to.deep.include({
        players: [
          createDummyPlayer({ id: 'two' })
        ]
      });
    });

    it('Should not be able to add a player with the same id', () => {
      const firstAdd = StateInstance.addPlayer(createDummyPlayer({ id: 'duplicateID' }));
      const secondAdd = StateInstance.addPlayer(createDummyPlayer({ id: 'duplicateID' }));

      expect(firstAdd).to.equal(true);
      expect(secondAdd).to.equal(false);
      expect(StateInstance).to.deep.include({
        players: [
          createDummyPlayer({ id: 'duplicateID' })
        ]
      });
    });
  });

  describe('removePlayer(id)', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should fail when no id is passed', () => {
      const result = StateInstance.removePlayer();
      expect(result).to.equal(false);
    });

    it('Should fail when the player doesn\'t exist in state', () => {
      const result = StateInstance.removePlayer('dummy_id');
      expect(result).to.equal(false);
    });

    it('Should remove a player', () => {
      // setup
      [
        createDummyPlayer({ id: 'first_player' }),
        createDummyPlayer({ id: 'second_player' })
      ].forEach(player => StateInstance.addPlayer(player));

      // execution
      const result = StateInstance.removePlayer('first_player');

      // result
      expect(result).to.equal(true);
      expect(StateInstance).to.deep.include({
        players: [
          createDummyPlayer({ id: 'second_player' })
        ]
      });
    });
  });

  describe('getPlayer(id)', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should return an empty object when no id is provided', () => {
      const result = StateInstance.getPlayer();
      expect(result).to.deep.equal(null);
    });

    it('Should return an empty object when the player isn\'t found', () => {
      const result = StateInstance.getPlayer('some_id');
      expect(result).to.deep.equal(null);
    });

    it('Should return the player when found', () => {
      const createdPlayer = createDummyPlayer({ id: 'player_to_find' });
      [
        createdPlayer,
        createDummyPlayer({ id: 'second_player' }),
        createDummyPlayer({ id: 'third_player' })
      ].forEach(player => StateInstance.addPlayer(player));

      const getPlayerResult = StateInstance.getPlayer('player_to_find');
      expect(getPlayerResult).to.deep.equal(createdPlayer);
    });
  });

  describe('updatePlayer(id, playerData)', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should return false when no players are present', () => {
      const result = StateInstance.updatePlayer('player_id', {});
      expect(result).to.equal(false);
    });

    it('Should not update a player with a different id', () => {
      const createdPlayer = createDummyPlayer({ id: 'player_added' });
      StateInstance.addPlayer(createdPlayer);

      const result = StateInstance.updatePlayer('player_id', {});
      expect(result).to.equal(false);
    });

    it('Should not update a player with the same id', () => {
      const createdPlayer = createDummyPlayer({ id: 'player_added' });
      StateInstance.addPlayer(createdPlayer);

      const result = StateInstance.updatePlayer('player_added', {});
      expect(result).to.equal(true);
    });
  });

  describe('removeInactivePlayers(activePlayers = [])', () => {
    it('Should return false when a falsy value is passed', () => {
      const result = StateInstance.removeInactivePlayers(null);
      expect(result).to.equal(false);
    });

    it('Should return false when anything other than an array is passed', () => {
      const result = StateInstance.removeInactivePlayers({});
      expect(result).to.equal(false);
    });

    it('Should return true when filtering by argument', () => {
      const result = StateInstance.removeInactivePlayers([]);
      expect(result).to.equal(true);
    });

    it('Should default to an empty list of active players', () => {
      const result = StateInstance.removeInactivePlayers();
      expect(result).to.equal(true);
    });
  });

  describe('isPlayersTurn(id)', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should return false when player doesn\'t exist', () => {
      const result = StateInstance.isPlayersTurn('non_existing_player_id');
      expect(result).to.equal(false);
    });

    it('Should return false when player doesn\'t exist', () => {
      const createdPlayer = createDummyPlayer({ id: 'player_added' });
      StateInstance.addPlayer(createdPlayer);

      const result = StateInstance.isPlayersTurn('player_added');
      expect(result).to.equal(true);
    });
  });

  describe('updatePlayersTurn()', () => {
    afterEach(() => {
      StateInstance.removeInactivePlayers([]);
    });

    it('Should be null when no players are in the game', () => {
      const result = StateInstance.updatePlayersTurn();
      expect(result).to.equal(null);
    });

    it('When one player is in the game it should be their turn', () => {
      const createdPlayer = createDummyPlayer({ id: 'player_added' });
      StateInstance.addPlayer(createdPlayer);

      const result = StateInstance.updatePlayersTurn();
      expect(result).to.deep.equal(createdPlayer);
    });

    it('When a cycle is completed it should start back with the first player', () => {
      const firstPlayer = createDummyPlayer({ id: 'player_one' });
      const secondPlayer = createDummyPlayer({ id: 'player_two' });
      [
        firstPlayer,
        secondPlayer
      ].forEach(player => StateInstance.addPlayer(player));

      StateInstance.updatePlayersTurn();
      const result = StateInstance.updatePlayersTurn();
      expect(result).to.deep.equal(firstPlayer);
    });
  });
});
