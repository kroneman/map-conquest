const sinon = require('sinon');
const { expect } = require('chai');

const logger = require('../../logger');

const gameState = require('../state');
const PlayerConnectionMixin = require('./playerConnection');

const PlayerConnection = PlayerConnectionMixin(class Connection {
  constructor() {
    this.playerID = 'player_id';
    this.io = {
      in() {
        return {
          emit(string, payload) {
            return payload;
          }
        };
      }
    };
  }
});
const playerConnectionInstance = new PlayerConnection();

describe('Player Connection', () => {
  before(() => {
    sinon.stub(logger, 'debug');
  });

  after(() => {
    logger.debug.restore();
  });


  it('Doesn\'t update a player when no associated game can be found', () => {
    const stubbedRoomManager = sinon.stub(gameState.RoomManager, 'get');
    stubbedRoomManager.onCall(0).returns(null);

    const result = playerConnectionInstance.updatePlayer({
      id: 'player_id',
      color: '#000',
      name: 'johnny'
    });
    expect(result).to.equal(false);
    gameState.RoomManager.get.restore();
  });

  it('Updates a player', () => {
    const stubbedRoomManager = sinon.stub(gameState.RoomManager, 'get');
    const stubbedGameManager = sinon.stub(gameState.GameManager, 'get');
    stubbedRoomManager.onCall(0).returns('gameID');
    stubbedGameManager.withArgs('gameID').returns({
      updatePlayer(playerID, playerData) {
        return playerData;
      }
    });

    const result = playerConnectionInstance.updatePlayer({
      id: 'player_id',
      color: '#000',
      name: 'johnny'
    });

    expect(result).to.equal(true);

    gameState.RoomManager.get.restore();
    gameState.GameManager.get.restore();
  });
});
