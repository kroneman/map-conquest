const compose = require('lodash/fp/compose');

const SpectatorBot = require('./helpers/spectator');

const CombinedBotFunctionality = compose()(SpectatorBot);

const thisBot = new CombinedBotFunctionality({
  name: 'spectator'
});

thisBot.initConnection();
