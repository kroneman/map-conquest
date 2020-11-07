const { expect } = require('chai');
const getLogLevel = require('./getLogLevel.js');

describe('Bot Logger Instantiation', () => {
  beforeEach(() => {
    process.env = { };
  });

  it('Defaults to running in production mode when no env is set', () => {
    const logLevel = getLogLevel();
    expect(logLevel).to.deep.equal('info');
  });

  it('Configures prod log level when node env is set to \'production\'', () => {
    process.env = { NODE_ENV: 'production' };
    const logLevel = getLogLevel();
    expect(logLevel).to.deep.equal('info');
  });

  it('Uses the BOT_LOG_LEVEL env variable when it is set and not in prod mode', () => {
    process.env = { NODE_ENV: 'development', BOT_LOG_LEVEL: 'warn' };
    const logLevel = getLogLevel();
    expect(logLevel).to.equal('warn');
  });
});
