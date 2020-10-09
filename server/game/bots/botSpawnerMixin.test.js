const { expect } = require('chai');
const BotSpawnerMixin = require('./botSpawnerMixin.js');
const logger = require('../../logger');

const Connections = BotSpawnerMixin(class ConnectionExtendedWithBotSpawner {});
const ConnectionInstance = new Connections();

/* eslint-disable prefer-arrow-callback, func-names */
describe('Server BotSpawner Connection Mixin', function () {
  it('StateInstance.spawnBot():', function () {
    this.timeout(1000);
    const spawnAmount = Math.max(Math.floor(Math.random() * 20), 1);
    logger.info('Spawning %s bots', spawnAmount);
    let i = 0;
    while (i < spawnAmount) {
      ConnectionInstance.spawnBot('default');
      i += 1;
    }

    expect(ConnectionInstance.botProcesses.length).to.equal(spawnAmount);
    ConnectionInstance.cleanUpChildren();
    expect(ConnectionInstance.botProcesses.length).to.equal(0);
  });
});
