const sinon = require('sinon');
// const { expect } = require('chai');

const logger = require('../../logger');

// const PlayerConnection = require('./playerConnection');
// const gamesState = require('../state');

// const Connection = PlayerConnection(class TestConnection {
//   constructor() {
//     this.io = {
//       in() {
//         return {
//           emit(arg1, arg2) {
//             return arg2;
//           }
//         };
//       }
//     };
//   }
// });
// const playerConnection = new Connectioan();

describe('Player Connection', () => {
  before(() => {
    sinon.stub(logger, 'debug');
  });

  after(() => {
    logger.debug.restore();
  });

  it('Has not been implemented');
});
