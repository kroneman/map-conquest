const has = require('lodash/has');
const GameInstanceState = require('./instance/instanceState');
const logger = require('../logger');

const GameManager = {
  games: {},

  create(gameID) {
    if (!gameID) {
      return null;
    }

    if (has(this.games, gameID)) {
      logger.silly('retrieving game from memory');
      return this.games[gameID];
    }

    logger.silly('creating new game instance');
    this.games[gameID] = new GameInstanceState({
      id: gameID,
      name: gameID
    });

    return this.games[gameID];
  },

  /**
   * Retrieves from memory if already instantiated in current session
   * @param {*} gameID - id of game
   * @returns {GameInstanceState} instance, whether from memory or a new instance
   */
  get(gameID) {
    if (!gameID) {
      return null;
    }

    if (has(this.games, gameID)) {
      logger.silly('retrieving game from memory');
      return this.games[gameID];
    }

    return this.create(gameID);
  },

  /**
   * Deletes a game from memory, when a name/room is unique
   * but an old instance with the same name is still in memory
   * @param {String} gameID to delete
   * @returns {Boolean}
   */
  delete(gameID) {
    logger.silly('deleting game instance');
    if (!gameID) {
      return false;
    }

    if (has(this.games, gameID)) {
      this.games[gameID] = null;
      delete this.games[gameID];
      return true;
    }

    return false;
  },

  reset() {
    Object.keys(this.games).forEach(
      gameID => this.delete(gameID)
    );
  }
};

const RoomManager = {
  rooms: {},

  /**
   * When joining a room adding it to own memory as well
   * so that we can update the list when the connection disconnects
   * @param {String} socketID
   * @param {String} gameID
   */
  add(socketID, gameID) {
    if (!gameID || !socketID) {
      logger.warn('assignToRoom: missing gameId or SocketID');
      return;
    }

    this.rooms[socketID] = gameID;
  },

  /**
   * Retrieves room assignment for a socket id
   * @param {string} socketID
   * @returns {string|null} room socket is assigned to or null if unassigned
   */
  get(socketID) {
    if (!socketID) {
      return null;
    }

    return has(this.rooms, socketID)
      ? this.rooms[socketID] : null;
  },

  /**
   * When joining a room adding it to own memory as well
   * so that we can update the list when the connection disconnects
   * @param {String} socketID
   * @param {String} gameID
   */
  remove(socketID) {
    if (!socketID) {
      logger.warn('assignToRoom: missing socketID');
      return;
    }

    if (has(this.rooms, socketID)) {
      this.rooms[socketID] = null;
      delete this.rooms[socketID];
    }

    logger.debug('%o', this.memory);
  },

  reset() {
    Object.keys(this.rooms).forEach(
      socketID => this.remove(socketID)
    );
  }
};

module.exports = {
  RoomManager,
  GameManager
};
