
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
    logger.debug(this.events.updatePlayerName);
    const gameID = gameState.getRoomAssignment(this.playerID);
    if (!gameID) {
      return;
    }

    const gameInstance = gameState.getGameInstance(gameID);
    gameInstance.updatePlayer(this.playerID, playerData);
    gameInstance.updateColorOptions();
    this.io.in(gameID).emit(this.events.gameDetails, gameInstance);
  }
};
