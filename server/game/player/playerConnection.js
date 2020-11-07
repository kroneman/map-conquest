
const logger = require('../../logger');
const gameState = require('../state');

module.exports = ConnectionClass => class extends ConnectionClass {
  constructor(props) {
    super(props);

    this.events = {
      updatePlayer: 'update-player'
    };

    this.handlers = {
      [this.events.updatePlayer]: this.updatePlayer
    };
  }

  /*
   * Updates the name of a connection
   */
  updatePlayer(playerData) {
    logger.debug(this.events.updatePlayer);
    const gameID = gameState.RoomManager.get(this.playerID);
    if (!gameID) {
      return false;
    }

    const gameInstance = gameState.GameManager.get(gameID);
    gameInstance.updatePlayer(this.playerID, playerData);
    this.io.in(gameID).emit(this.events.gameDetails, gameInstance);
    return true;
  }
};
