const path = require('path');
const util = require('util');
const filter = require('lodash/filter');
const map = require('lodash/map');
const fse = require('fs-extra');
// Promisified read and remove functions
const readDir = util.promisify(fse.readdir);
const removeFile = util.promisify(fse.unlink);

const LOG_FOLDER = path.resolve(__dirname, '../logs');

cleanLogs();
async function cleanLogs() {
  const dirContents = await readDir(LOG_FOLDER);
  const filteredContents = filter(dirContents, file => file.includes('.log'));
  const result = await Promise.all(
    map(filteredContents, logFile => removeFile(path.join(LOG_FOLDER, logFile)))
  );

  // if result of promises are undefined files were removed successfully
  const isSuccess = result.every(value => value === undefined);

  /* eslint-disable no-console */
  console.log(
    isSuccess
      ? `Successfully cleaned ${filteredContents.join(', ')}`
      : `Error cleaning ${filteredContents.join(', ')}`
  );
  /* eslint-enable */
}
