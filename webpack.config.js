const clientConfig = require('./client/webpack.client');

/**
 * Shared configuration that can be overridden by each config
 * May turn this around though so that this overrides
 */
const commonConfig = {
  mode: 'production'
};

/**
 * Setup this way so we can run multiple webpack configurations if necessary
 * Also initially was running typescript on the server and this is a remnant of that
 */
const webpackConfig = [
  {
    ...commonConfig,
    ...clientConfig
  }
];

module.exports = webpackConfig;
