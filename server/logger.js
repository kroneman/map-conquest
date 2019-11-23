const winston = require('winston');
const path = require('path');

// Set to any of
// error, warn, info, verbose, debug, silly
// in order of verbosity
const DEV_LOG_LEVEL = 'debug';
const PROD_LOG_LEVEL = 'info';
const { SERVER_LOG_LEVEL } = process.env;

const LOGS_DIRECTORY = path.join(__dirname, '../logs');
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? PROD_LOG_LEVEL : DEV_LOG_LEVEL;
const { Console, File } = winston.transports;

module.exports = winston.createLogger({
  level: SERVER_LOG_LEVEL || LOG_LEVEL,
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.json(),
    winston.format.colorize(),
  ),
  transports: [
    new File({ filename: path.join(LOGS_DIRECTORY, './error.log'), level: 'error' }),
    new File({ filename: path.join(LOGS_DIRECTORY, 'combined.log') }),
    new Console({ format: winston.format.simple() })
  ]
});
