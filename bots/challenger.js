const compose = require('lodash/fp/compose');

const BaseBot = require('./base');

const PointBasedAttack = require('./mixins/pointBasedAttack');

const CombinedBotFunctionality = compose(
  PointBasedAttack
)(BaseBot);

const thisBot = new CombinedBotFunctionality({
  name: 'challenger'
});

thisBot.initConnection();
