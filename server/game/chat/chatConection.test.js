const sinon = require('sinon');
const { expect } = require('chai');

const logger = require('../../logger');

const gameState = require('../state');
const ChatConnectionMixin = require('./chatConnection');

const PlayerConnection = ChatConnectionMixin(class Connection {
  constructor() {
    this.playerID = 'player_id';
    this.emitToAllInGame = () => {};
  }
});
const playerConnectionInstance = new PlayerConnection();

describe('ChatConnection', () => {
  before(() => {
    sinon.stub(logger, 'debug');
  });

  after(() => {
    logger.debug.restore();
  });

  afterEach(() => {
    gameState.RoomManager.get.restore();
    gameState.GameManager.get.restore();
  });

  describe('addChatMessage(message)', () => {
    it('Should not add a chat message when no gameID is found', () => {
      const roomManagerSpy = sinon.spy(gameState.RoomManager, 'get');
      const gameManagerSpy = sinon.spy(gameState.GameManager, 'get');

      playerConnectionInstance.addChatMessage('hello world');

      expect(roomManagerSpy.called).to.equal(true);
      expect(gameManagerSpy.notCalled).to.equal(true);
    });

    it('Should be able to add a chat message as a player to the game chat when it is found', () => {
      const roomManagerStub = sinon.stub(gameState.RoomManager, 'get');
      const gameManagerStub = sinon.stub(gameState.GameManager, 'get');
      const addChatMessageSpy = sinon.spy();

      roomManagerStub.withArgs('player_id').returns('my_game');
      gameManagerStub.withArgs('my_game').returns({
        isPlayer: () => true,
        getPlayer: () => ({}),
        addChatMessage: addChatMessageSpy
      });

      playerConnectionInstance.addChatMessage('hello world');
      expect(addChatMessageSpy.calledWith({}, 'hello world')).to.equal(true);
    });

    it('Should be able to add a chat message as a spectator', () => {
      const roomManagerStub = sinon.stub(gameState.RoomManager, 'get');
      const gameManagerStub = sinon.stub(gameState.GameManager, 'get');
      const addChatMessageSpy = sinon.spy();

      roomManagerStub.withArgs('player_id').returns('my_game');
      gameManagerStub.withArgs('my_game').returns({
        isPlayer: () => false,
        getSpectator: () => ({}),
        addChatMessage: addChatMessageSpy
      });

      playerConnectionInstance.addChatMessage('hello world');
      expect(addChatMessageSpy.calledWith({}, 'hello world')).to.equal(true);
    });
  });
});
