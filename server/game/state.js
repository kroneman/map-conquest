const has = require('lodash/has');
const GameInstanceState = require('./instance/instanceState');
const logger = require('../logger');

/**
 * This state sould probably be reactive
 */
module.exports = {
  memory: {
    games: {},
    assignedToRoom: {}
  },

  /**
   * Retrieves from memory if already instantiated in current session
   * @param {*} gameID - id of game
   * @returns {GameInstanceState} instance, whether from memory or a new instance
   */
  getGameInstance(gameID) {
    if (!gameID) {
      return null;
    }

    if (has(this.memory.games, gameID)) {
      logger.silly('retrieving game from memory');
      return this.memory.games[gameID];
    }

    logger.silly('creating new game instance');
    this.memory.games[gameID] = new GameInstanceState({
      id: gameID,
      name: gameID
    });

    return this.memory.games[gameID];
  },

  /**
   * Deletes a game from memory, when a name/room is unique
   * but an old instance with the same name is still in memory
   * @param {String} gameID to delete
   * @returns {null}
   */
  deleteGameInstance(gameID) {
    logger.silly('deleting game instance');
    if (!gameID) {
      return null;
    }

    if (has(this.memory.games, gameID)) {
      delete this.memory.games[gameID];
    }

    return null;
  },

  /**
   * When joining a room adding it to own memory as well
   * so that we can update the list when the connection disconnects
   * @param {String} socketID
   * @param {String} gameID
   */
  assignToRoom(socketID, gameID) {
    if (!gameID || !socketID) {
      logger.warn('assignToRoom: missing gameId or SocketID');
      return;
    }

    this.memory.assignedToRoom[socketID] = gameID;
  },

  /**
   * When joining a room adding it to own memory as well
   * so that we can update the list when the connection disconnects
   * @param {String} socketID
   * @param {String} gameID
   */
  removeFromRoom(socketID) {
    if (!socketID) {
      logger.warn('assignToRoom: missing socketID');
      return;
    }

    if (has(this.memory.assignedToRoom, socketID)) {
      this.memory.assignedToRoom[socketID] = null;
      delete this.memory.assignedToRoom[socketID];
    }

    logger.debug('%o', this.memory);
  },

  /**
   * Retrieves room assignment for a socket id
   * @param {string} socketID
   * @returns {string|null} room socket is assigned to or null if unassigned
   */
  getRoomAssignment(socketID) {
    if (!socketID) {
      return null;
    }

    return has(this.memory.assignedToRoom, socketID)
      ? this.memory.assignedToRoom[socketID] : null;
  }
};
