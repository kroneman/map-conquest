const LOG_LEVELS = {
  development: 'debug',
  test: 'debug',
  production: 'info'
};

// Set to any of
// error, warn, info, verbose, debug, silly
// in order of verbosity
const getLogLevel = () => {
  const { BOT_LOG_LEVEL, NODE_ENV } = process.env;
  const isProduction = !NODE_ENV || NODE_ENV === 'production';
  const devLogLevel = BOT_LOG_LEVEL || LOG_LEVELS[NODE_ENV];

  return isProduction
    ? LOG_LEVELS.production
    : devLogLevel;
};

module.exports = getLogLevel;