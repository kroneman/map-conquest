const sinon = require('sinon');
const { expect } = require('chai');

process.env = {
  DEBUG_GAME_PLACEMENT_MODE: 'manual',
  DEBUG_GAME_REINFORCEMENT_MODE: 'manual'
};

const state = require('./state');
const logger = require('../logger');

describe('GameStateManager', () => {
  before(() => {
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'debug');
    sinon.stub(logger, 'warn');
  });

  after(() => {
    logger.info.restore();
    logger.debug.restore();
    logger.warn.restore();
  });

  describe('GameManager default', () => {
    const { GameManager } = state;
    it('Keeps a dictionary of games in memory', () => {
      expect(GameManager.games).to.deep.equal({});
    });
  });

  describe('GameManager with a game', () => {
    const { GameManager } = state;

    beforeEach(() => {
      GameManager.create('<my_game_id>');
    });

    afterEach(() => {
      GameManager.reset();
    });

    it('Create adds a new game to state', () => {
      GameManager.create('<new_game_id>');
      expect(GameManager.games).to.deep.equal({
        '<new_game_id>': defaultGameInstanceState('<new_game_id>'),
        '<my_game_id>': defaultGameInstanceState('<my_game_id>')
      });
    });

    it('Create returns null when no gameID is passed', () => {
      const createResult = GameManager.create();
      expect(createResult).to.deep.equal(null);
    });

    it('Create returns an existing game if one with the same id exists', () => {
      const createResult = GameManager.create('<my_game_id>');
      expect(createResult).to.deep.equal(defaultGameInstanceState('<my_game_id>'));
    });

    it('Get returns a gameInstance', () => {
      const gameInstance = GameManager.get('<my_game_id>');
      expect(gameInstance).to.deep.equal(
        defaultGameInstanceState('<my_game_id>')
      );
    });

    it('Get returns null when no gameID is passed', () => {
      const gameInstance = GameManager.get();
      expect(gameInstance).to.deep.equal(null);
    });

    it('Get creates a game if one doesn\'t already exist with the passed gameID', () => {
      process.env = {
        DEBUG_GAME_PLACEMENT_MODE: 'manual',
        DEBUG_GAME_REINFORCEMENT_MODE: 'manual'
      };
      GameManager.get('<some_non_existing_game>');
      expect(GameManager.games).to.deep.equal({
        '<some_non_existing_game>': defaultGameInstanceState('<some_non_existing_game>'),
        '<my_game_id>': defaultGameInstanceState('<my_game_id>')
      });
    });

    it('Delete removes a game from memory', () => {
      GameManager.delete('<my_game_id>');
      expect(GameManager.games).to.deep.equal({});
    });

    it('Delete returns null when no gameID is passed', () => {
      const deleteResult = GameManager.delete();
      expect(deleteResult).to.deep.equal(false);
    });

    it('Delete removes a game from memory and returns true if game existed', () => {
      const deleteResult = GameManager.delete('<my_game_id>');
      expect(deleteResult).to.deep.equal(true);
    });

    it('Delete removes a game from memory and returns true if game didn\'t exist', () => {
      const deleteResult = GameManager.delete('<my_non_existent_game>');
      expect(deleteResult).to.deep.equal(false);
    });

    it('Reset removes all games from instance', () => {
      GameManager.reset();
      expect(GameManager.games).to.deep.equal({});
    });
  });

  describe('RoomManager default', () => {
    const { RoomManager } = state;
    it('Keeps a dictionary of rooms in memory', () => {
      expect(RoomManager.rooms).to.deep.equal({});
    });

    describe('Missing Parameters on methods are handled properly', () => {
      it('Add Does nothing (returns void) if no parameters are passed', () => {
        RoomManager.add();
        expect(RoomManager.rooms).to.deep.equal({});
      });

      it('Add Does nothing (returns void) if gameID argument is missing', () => {
        RoomManager.add('socketID');
        expect(RoomManager.rooms).to.deep.equal({});
      });

      it('Add Does nothing (returns void) if socketID argument is undefined', () => {
        RoomManager.add(undefined, 'socketID');
        expect(RoomManager.rooms).to.deep.equal({});
      });

      it('Get Does nothing (returns null) if socketID argument is undefined', () => {
        RoomManager.get();
        expect(RoomManager.rooms).to.deep.equal({});
      });

      it('Remove Does nothing (returns null) if socketID argument is undefined', () => {
        RoomManager.remove();
        expect(RoomManager.rooms).to.deep.equal({});
      });
    });
  });

  describe('RoomManager with initialized rooms', () => {
    const { RoomManager } = state;
    // setup
    beforeEach(() => {
      RoomManager.add('<my_socket_id>', '<my_game_id>');
    });

    // teardown
    afterEach(() => {
      RoomManager.reset();
    });

    it('Get retrieves the associated gameID by socket when it exists', () => {
      const gameID = RoomManager.get('<my_socket_id>');
      expect(gameID).to.deep.equal('<my_game_id>');
    });

    it('Get returns a null value when a socket id is not present', () => {
      const gameID = RoomManager.get('<non_existent_socket_id>');
      expect(gameID).to.deep.equal(null);
    });

    it('Can remove a game by socket Id', () => {
      RoomManager.remove('<my_socket_id>');
      expect(RoomManager.rooms).to.deep.equal({});
    });

    it('Checks existence of a room assignment before attempting to remove', () => {
      // ended here
      RoomManager.remove('<non_existent_socket_id>');
      expect(RoomManager.rooms).to.deep.equal({
        '<my_socket_id>': '<my_game_id>'
      });
    });
  });
});

/**
 */
function defaultGameInstanceState(gameID) {
  return {
    availableTerritories: [
      'alberta',
      'mongolia',
      'venezuela',
      'iceland',
      'eastern-africa',
      'middle-east',
      'brazil',
      'egyptian-region',
      'irkutsk',
      'north-western-territory',
      'kamchatka',
      'congo',
      'western-europe',
      'eastern-united-states',
      'western-united-states',
      'greenland',
      'kazakhstan',
      'southern-africa',
      'argentina',
      'india',
      'indonesia',
      'ukraine',
      'new-guinea',
      'northern-europe',
      'ontario',
      'southern-europe',
      'quebec',
      'ural',
      'central-america',
      'siam',
      'madagascar',
      'eastern-australia',
      'peru',
      'great-britain',
      'japan',
      'north-africa',
      'yakutsk',
      'western-australia',
      'alaska',
      'siberia',
      'scandanavia',
      'china'
    ],
    chat: [],
    colorOptions: ['#000', '#720000', '#025839', '#4013AF', '#04859D'],
    continentOwnership: {},
    continents: {
      africa: [
        'eastern-africa',
        'egyptian-region',
        'congo',
        'southern-africa',
        'madagascar',
        'north-africa'
      ],
      asia: [
        'mongolia',
        'middle-east',
        'irkutsk',
        'kamchatka',
        'kazakhstan',
        'india',
        'ural',
        'siam',
        'japan',
        'yakutsk',
        'siberia',
        'china'
      ],
      australia: [
        'indonesia',
        'new-guinea',
        'eastern-australia',
        'western-australia'
      ],
      europe: [
        'iceland',
        'western-europe',
        'ukraine',
        'northern-europe',
        'southern-europe',
        'great-britain',
        'scandanavia'
      ],
      'north-america': [
        'alberta',
        'north-western-territory',
        'eastern-united-states',
        'western-united-states',
        'greenland',
        'ontario',
        'quebec',
        'central-america',
        'alaska'
      ],
      'south-america': ['venezuela', 'brazil', 'argentina', 'peru']
    },
    gameStarted: false,
    id: gameID,
    isInitialPlacementFinished: false,
    name: gameID,
    placementMode: 'manual',
    placementModeOptions: ['automatic', 'manual'],
    playerTurnIndex: 0,
    players: [],
    reinforcementMode: 'manual',
    reinforcementModeOptions: ['automatic', 'manual'],
    spectators: [],
    territories: {},
    territoryMap: {}
  };
}
