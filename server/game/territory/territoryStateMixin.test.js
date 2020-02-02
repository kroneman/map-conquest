const { expect } = require('chai');
const TerritoryStateMixin = require('./territoryStateMixin');

const State = TerritoryStateMixin(class StateExtendedTerritory {});
const StateInstance = new State();

describe('Server Territory State Mixin', () => {
  it('StateInstance.getTerritory():', () => {
    const territory = StateInstance.getTerritory('fakeTerritory');
    expect(territory).to.equal(null);

    process.nextTick(() => console.log(StateInstance.availableTerritories));
  });
});
