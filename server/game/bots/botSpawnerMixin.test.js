const sinon = require('sinon');
const { expect } = require('chai');
const BotSpawnerMixin = require('./botSpawnerMixin.js');
const logger = require('../../logger');

const Connections = BotSpawnerMixin(class ConnectionExtendedWithBotSpawner {});
const ConnectionInstance = new Connections();

/* eslint-disable prefer-arrow-callback, func-names */
describe('The server spawns bots to connect to the server and play in games', function () {
  before(() => {
    sinon.stub(logger, 'info');
  });

  after(() => {
    logger.info.restore();
  });

  afterEach(() => {
    ConnectionInstance.cleanUpChildren();
  });

  it('A process is created for each bot', function () {
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

  it('Processes are cleaned when the server shuts down', () => {
    ConnectionInstance.spawnBot('default');
    ConnectionInstance.onServerDie();
    expect(ConnectionInstance.botProcesses.length).to.equal(0);
  });

  it('Validates the \'type\' of bot to spawn against predefined configurations', function () {
    ConnectionInstance.spawnBot('invalid_type');
    expect(ConnectionInstance.botProcesses.length).to.equal(0);
  });

  it('Defaults to the default bot when no argument is passed', () => {
    ConnectionInstance.spawnBot();
    expect(ConnectionInstance.botProcesses.length).to.equal(1);
  });

  describe('Passing arguments to the subProcess', () => {
    it('Defaults to empty', () => {
      const args = Connections.spawnArgs();
      expect(args).to.deep.equal([]);
    });

    it('Passes the type as -t', () => {
      const args = Connections.spawnArgs('default');
      expect(args).to.deep.equal(['-t', 'default']);
    });
  });
});
