const winston = require('winston');
const path = require('path');

const getLogLevel = require('./getLogLevel');

require('dotenv').config({
  path: path.resolve('.env')
});

const LOGS_DIRECTORY = path.resolve('./logs');
const { Console, File } = winston.transports;

module.exports = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.json(),
    winston.format.colorize(),
  ),
  transports: [
    new File({ filename: path.join(LOGS_DIRECTORY, './bot-error.log'), level: 'error' }),
    new File({ filename: path.join(LOGS_DIRECTORY, 'bot-combined.log') }),
    new Console({ format: winston.format.simple() })
  ]
});
