const compose = require('lodash/fp/compose');

const BaseBot = require('./base');

const ContinentBasedAttack = require('./mixins/continentBasedAttack');

const CombinedBotFunctionality = compose(
  ContinentBasedAttack
)(BaseBot);

const thisBot = new CombinedBotFunctionality();

thisBot.initConnection();
