const logger = require('../../logger');
const gameState = require('../state');

module.exports = ConnectionClass => class extends ConnectionClass {
  constructor(props) {
    super(props);

    this.events = {
      chatMessageSent: 'chat-send-message',
      chatNewMessage: 'chat-new-message'
    };

    this.handlers = {
      [this.events.chatMessageSent]: this.addChatMessage
    };
  }

  /**
   * @param {string} message to add to chat
   * @returns {void}
   */
  addChatMessage(message) {
    logger.debug(this.events.chatMessageSent);
    const gameID = gameState.getRoomAssignment(this.playerID);
    if (!gameID) {
      return;
    }

    const gameInstance = gameState.getGameInstance(gameID);
    const isPlayer = gameInstance.isPlayer(this.playerID);
    const method = isPlayer ? 'getPlayer' : 'getSpectator';
    const player = gameInstance[method](this.playerID);

    gameInstance.addChatMessage(player, message);

    logger.debug('%o', gameInstance.chat);
    this.emitToAllInGame(
      this.events.gameDetails,
      gameInstance
    );
  }
};
