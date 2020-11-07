const map = require('lodash/map');
const filter = require('lodash/filter');

const gameState = require('../game/state');
const { DEFAULT_ROOM, NAMED_ROOM_NAMESPACE } = require('../constants');
const logger = require('../logger');

/**
 * Main Execution
 * https://socket.io/docs/emit-cheatsheet/
 * Class constructor used for new connections
 * This way io can be passed as an argument to different handlers
 * @param {*} socket instance created upon successful connection
 */
module.exports = class Connection {
  constructor(io) {
    this.io = io;
    this.socket = null;
    this.privateEvents = {
      connection: 'connection',
      disconnect: 'disconnect'
    };

    this.privateHandlers = {
      // [this.events.connection]: this.onConnection,
      [this.events.disconnect]: this.onDisconnected
    };
    this.handlers = {};

    this.rooms = null;
    this.playerID = null;
  }

  get events() {
    return this.privateEvents;
  }

  set events(events) {
    this.privateEvents = {
      ...this.privateEvents,
      ...events
    };
  }

  /**
   * New Connection handler
   * @param {*} socket from socket.io
   */
  connect(socket) {
    this.socket = socket;
    this.rooms = socket.adapter.rooms;
    this.playerID = socket.id;

    // Listeners
    this.setConnectionToRoom(DEFAULT_ROOM);
    this.bindSocketEventHandlers();
  }


  /**
   * Handles dropping of connections
   */
  onDisconnected() {
    logger.info(`${this.events.disconnect}: ${this.playerID}`);

    const gameID = gameState.RoomManager.get(this.playerID);
    const gameInstance = gameState.GameManager.get(gameID);
    if (!gameInstance || gameID === DEFAULT_ROOM) {
      return;
    }

    const gameRoom = this.rooms[gameID];
    const connectionsInGame = gameRoom && gameRoom.sockets ? gameRoom.sockets : [];
    gameInstance.removeInactivePlayers(Object.keys(connectionsInGame));

    this.socket.to(gameID).emit(this.events.gameDetails, gameInstance);
  }

  /**
   * Whenever a mixin or descendent sets handlers
   * Keep a combined copy for internal use to bind events
   * @param {{ [key:string]: Function }} handlers
   */
  set handlers(handlers) {
    this.privateHandlers = {
      ...this.privateHandlers,
      ...handlers
    };
  }

  /**
   * Got tired of binding this every time
   * Preserves context of this to class and mixins
   * @param { [key]: function } handlers
   */
  bindSocketEventHandlers() {
    const handlerKeys = Object.keys(this.privateHandlers);
    handlerKeys.map(
      event => this.socket.on(
        event,
        this.privateHandlers[event].bind(this)
      )
    );
  }

  /**
   * Sets connection state and game state that a user is now part of a specific 'room'
   * https://socket.io/docs/rooms-and-namespaces/
   * @param {string} roomID
   */
  setConnectionToRoom(roomID) {
    this.socket.join(roomID);
    gameState.RoomManager.add(this.socket.id, roomID);
  }

  /**
   * Remove a player from the room
   * https://socket.io/docs/rooms-and-namespaces/
   * @param {string} roomID
   */
  removeConnectionFromRoom(roomID) {
    this.socket.leave(roomID);
    gameState.RoomManager.remove(this.socket.id);
  }

  /**
   * Since each connected socket gets its own room a namespace is used to differentiate
   * the user created rooms and automatically created ones
   */
  filteredRooms() {
    const mappedRooms = map(
      this.rooms,
      (value, id) => ({ id, value, players: value.length })
    );
    const filteredRooms = filter(
      mappedRooms,
      mappedRoom => mappedRoom.id.includes(NAMED_ROOM_NAMESPACE)
    );

    return filteredRooms && filteredRooms.length ? filteredRooms : [];
  }

  /**
   * @param {Array<String>} rooms to check against for uniqueness
   * @param {String} name of room to validate
   * @returns {Boolean}
   */
  isGameNameUnique(name) {
    const filteredRooms = this.filteredRooms(this.rooms);
    const existingGamesWithName = filter(filteredRooms, room => room.id === name);
    return (existingGamesWithName.length < 1);
  }

  /**
   * Emit event to all connections in the game session
   * @param {string} event
   * @param {*} payload to send to listeners
   */
  emitToAllInGame(event, payload = {}) {
    const gameID = gameState.RoomManager.get(this.playerID);
    this.io.in(gameID).emit(event, payload);
  }

  /**
   * Broadcasts to all connections
   * @param {string} event
   * @param {*} payload
   */
  emitBroadcast(event, payload = {}) {
    this.io.emit(event, payload);
  }
};
