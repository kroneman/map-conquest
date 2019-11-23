const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const logger = require('../../logger');

const execPromise = util.promisify(exec);
const botScriptLocation = path.resolve('./bots/bot.js');

module.exports = ConnectionClass => class extends ConnectionClass {
  constructor(props) {
    super(props);

    this.events = {
      requestBotPlayer: 'request-bot-player'
    };

    this.handlers = {
      [this.events.requestBotPlayer]: this.spawnBot
    };
  }

  /**
   * @param {string} message to add to chat
   * @returns {void}
   */
  async spawnBot() {
    logger.info(this.gameID);
    const botInstance = await execPromise(`node ${botScriptLocation}`);
    logger.info('%o', botInstance);
  }
};
