const winston = require('winston');
const path = require('path');
const getLogLevel = require('./getLogLevel');

const LOGS_DIRECTORY = path.join(__dirname, '../logs');
const { Console, File } = winston.transports;

module.exports = winston.createLogger({
  level: getLogLevel(),
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
