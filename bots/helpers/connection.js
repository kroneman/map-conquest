const path = require('path');
const io = require('socket.io-client');

const logger = require('./logger');

const { PORT, SOCKET_ENDPOINT } = process.env;
const socketEndpoint = SOCKET_ENDPOINT || `http://localhost:${PORT || 3000}`;

require('dotenv').config({
  path: path.resolve('.env')
});

module.exports = class BotConnection {
  constructor() {
    this.socket = null;
    this.privateEvents = {
      connect: 'connect',
      disconnect: 'disconnect'
    };

    this.privateHandlers = {
      [this.events.connect]: this.onConnected,
      [this.events.disconnect]: this.onDisconnect
    };
    this.handlers = {};

    this.speed = 100;
  }

  /**
   * Events getter
   * Called when this.events gets accessed
   */
  get events() {
    return this.privateEvents;
  }

  /**
   * Events Setter
   * Called when this.events changes
   */
  set events(events) {
    this.privateEvents = {
      ...this.privateEvents,
      ...events
    };
  }

  /**
   * Initialize connection
   */
  initConnection() {
    this.socket = io.connect(socketEndpoint);
    this.bindSocketEventHandlers(this.handlers);
  }

  /**
   * On Successful connection
   */
  onConnected() {
    logger.debug('connected');
    this.socket.emit(this.events.listGames);
  }

  /**
   * Util to speed up or slow down game
   * Or portions of the game
   */
  sleep(fn, sleepSpeed = this.speed) {
    setTimeout(fn, sleepSpeed);
  }

  /**
   * On Socket Disconnect
   */
  onDisconnect() {
    logger.info(`${this.id} Disconnected from server`);
  }

  /**
   * Whenever a mixin or descendent sets hanlders
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
};
