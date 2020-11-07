const { spawn } = require('child_process');
const path = require('path');
const logger = require('../../logger');
const botTypes = require('../../../bots/types.js');

const botScriptLocation = path.resolve('./bots/botRunner.js');
const botOptions = Object.keys(botTypes);

/**
  * @param {ChildProcess} botSpawn https://nodejs.org/api/child_process.html#child_process_class_childprocess
  * @returns {void}
  */
const handleProcessEvents = (botProcess, type) => {
  const botLogPrefix = `BOT-${botProcess.pid}-${type}`;
  logger.info(`${botLogPrefix}: Spawning`);
  botProcess.on('error', () => logger.info(`${botLogPrefix}: Failed to start subprocess.`));
  botProcess.stdout.on('data', data => logger.info(`${botLogPrefix}: %s`, data));
  botProcess.stderr.on('data', data => logger.error(`${botLogPrefix}: %s`, data));
  botProcess.on('exit', () => logger.info(`${botLogPrefix}: %s`, 'Exiting'));
};

module.exports = ConnectionClass => class BotSpawner extends ConnectionClass {
  constructor(props) {
    super(props);

    this.events = {
      requestBotPlayer: 'request-bot-player'
    };

    this.handlers = {
      [this.events.requestBotPlayer]: this.spawnBot
    };

    this.botProcesses = [];
    this.cleanUpChildren = this.cleanUpChildren.bind(this);
    process.on('SIGINT', this.onServerDie.bind(this));
    process.on('exit', this.onServerDie.bind(this));
  }

  static spawnArgs(botType) {
    return botType ? ['-t', botType] : [];
  }

  /**
   * Creates a bot subprocess
   * @param {String} botType
   * @returns {void}
   */
  spawnBot(botType = 'default') {
    const isValidBotType = botOptions.includes(botType);
    if (!isValidBotType) {
      return;
    }

    const spawnArgs = BotSpawner.spawnArgs(botType);
    const botSpawn = spawn('node', [botScriptLocation, ...spawnArgs], {});
    handleProcessEvents(botSpawn, botType);
    this.botProcesses.push(botSpawn);
  }

  /**
   * Gets called on SIGINT or Exit events
   * @returns {void}
   */
  onServerDie() {
    this.cleanUpChildren();
  }

  /**
   * Loops through active child processes and stops them from running
   * @returns {void}
   */
  cleanUpChildren() {
    const { botProcesses } = this;
    while (botProcesses.length) {
      const firstInStack = botProcesses.shift();
      firstInStack.kill(1);
    }
  }
};
