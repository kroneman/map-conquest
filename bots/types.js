// Base Types
const BaseBot = require('./base/bot');
const SpectatorBot = require('./base/spectator');

// Options
const ContinentBasedAttack = require('./mixins/continentBasedAttack');
const PointBasedAttack = require('./mixins/pointBasedAttack');

const defaultSchema = {
  base: BaseBot,
  props: {},
  mixins: []
};

const botTypes = {
  default: {
    ...defaultSchema,
    mixins: [
      ContinentBasedAttack
    ]
  },
  challenger: {
    ...defaultSchema,
    props: {
      name: 'challenger'
    },
    mixins: [
      PointBasedAttack
    ]
  },
  spectator: {
    ...defaultSchema,
    base: SpectatorBot
  }
};

module.exports = botTypes;
