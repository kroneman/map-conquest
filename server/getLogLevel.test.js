const { expect } = require('chai');
const getLogLevel = require('./getLogLevel.js');

describe('Logger Instantiation', () => {
  it('Defaults to running in production mode when no env is set', () => {
    const logLevel = getLogLevel();
    expect(logLevel).to.deep.equal('info');
  });

  it('Configures prod log level when node env is set to \'development\'', () => {
    process.env = { NODE_ENV: 'development' };
    const logLevel = getLogLevel();
    expect(logLevel).to.deep.equal('debug');
  });
});
