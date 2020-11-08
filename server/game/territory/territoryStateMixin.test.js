const { expect } = require('chai');
const sample = require('lodash/sample');
const find = require('lodash/find');

process.env.SERVER_LOG_LEVEL = 'error';

const TerritoryStateMixin = require('./territoryStateMixin');

// Utility to create dummy players for tests
const createDummyPlayer = config => ({
  id: 'randomInvalidID',
  name: 'Dummy Player',
  color: '#fff',
  // Todo: Refactor to not add reinforcements right away when adding a player to the game
  reinforcements: 40,
  ...config
});
const State = TerritoryStateMixin(class StateExtendedTerritory {
  constructor() {
    this.players = [];
  }

  getPlayer(id) {
    return find(this.players, player => player.id === id);
  }

  createPlayer(config) {
    const player = createDummyPlayer(config);
    this.players.push(player);
    return player;
  }

  resetPlayers() {
    this.players = [];
  }
});
const StateInstance = new State();

describe('territoryState', () => {
  it('StateInstance.availableTerritories', () => {
    // actual length should be 42, also this will vary based on the dataset
    expect(StateInstance.availableTerritories).to.have.lengthOf(42);

    const sampleTerritory = sample(StateInstance.availableTerritories);
    const dummyPlayer = createDummyPlayer();

    StateInstance.claimTerritory(sampleTerritory, dummyPlayer);

    expect(StateInstance.availableTerritories).to.not.include(sampleTerritory);
  });

  it('StateInstance.claimTerritory():', () => {
    StateInstance.resetTerritories();

    const sampleTerritory = sample(StateInstance.availableTerritories);
    const dummyPlayer = createDummyPlayer();

    StateInstance.claimTerritory(sampleTerritory, dummyPlayer);

    expect(StateInstance).to.deep.include({
      territories: {
        [sampleTerritory]: {
          armies: 1,
          playerID: dummyPlayer.id,
          color: dummyPlayer.color
        }
      }
    });
  });

  it('StateInstance.territoryMap:', () => {
    StateInstance.resetTerritories();

    const sampleTerritory = sample(StateInstance.availableTerritories);
    const dummyPlayer = createDummyPlayer();

    StateInstance.claimTerritory(sampleTerritory, dummyPlayer);

    expect(StateInstance).to.deep.include({
      territoryMap: {
        [dummyPlayer.id]: [sampleTerritory]
      }
    });
  });

  it('StateInstance.getTerritory():', () => {
    StateInstance.resetTerritories();

    const sampleTerritory = sample(StateInstance.availableTerritories);
    const dummyPlayer = createDummyPlayer();

    StateInstance.claimTerritory(sampleTerritory, dummyPlayer);

    const retrievedTerritory = StateInstance.getTerritory(sampleTerritory);
    expect(retrievedTerritory).to.deep.equal(
      StateInstance.territories[sampleTerritory]
    );
  });

  it('StateInstance.isPlayersTerritory():', () => {
    StateInstance.resetTerritories();

    const sampleTerritory = sample(StateInstance.availableTerritories);
    const dummyPlayer = createDummyPlayer({ id: 'isPlayersTerritory' });

    StateInstance.claimTerritory(sampleTerritory, dummyPlayer);

    const isPlayersTerritory = StateInstance.isPlayersTerritory(sampleTerritory, dummyPlayer);
    expect(isPlayersTerritory).to.deep.equal(true);
  });

  it('StateInstance.territoriesAreAvailable:', () => {
    StateInstance.resetTerritories();

    const dummyPlayer = createDummyPlayer({ id: 'territoriesAreAvailable' });

    expect(StateInstance.territoriesAreAvailable).to.deep.equal(true);
    while (StateInstance.territoriesAreAvailable) {
      const sampleTerritory = sample(StateInstance.availableTerritories);
      expect(StateInstance.territoriesAreAvailable).to.deep.equal(true);
      StateInstance.claimTerritory(sampleTerritory, dummyPlayer);
    }
    expect(StateInstance.territoriesAreAvailable).to.deep.equal(false);
  });

  it('StateInstance.getPlayerTerritories():', () => {
    StateInstance.resetTerritories();

    const player = createDummyPlayer({ id: 'getPlayerTerritories' });
    const sampleTerritory = sample(StateInstance.availableTerritories);
    StateInstance.claimTerritory(sampleTerritory, player);

    const playerTerritories = StateInstance.getPlayerTerritories(player.id);
    expect(playerTerritories).to.deep.equal([sampleTerritory]);
  });

  it('StateInstance.getRandomPlayerTerritory():', () => {
    // not sure what the best way to test random functionality
    // just testing if it is one of the player's territories
    StateInstance.resetTerritories();

    const player = createDummyPlayer({ id: 'getRandomPlayerTerritory' });
    const sampleTerritory = sample(StateInstance.availableTerritories);
    StateInstance.claimTerritory(sampleTerritory, player);

    const playerTerritories = StateInstance.getPlayerTerritories(player.id);
    const randomPlayerTerritory = StateInstance.getRandomPlayerTerritory(player.id);

    expect(playerTerritories).to.deep.include(randomPlayerTerritory);
  });

  it('StateInstance.territoryLosesArmies():', () => {
    StateInstance.resetTerritories();

    const player = createDummyPlayer({ id: 'getRandomPlayerTerritory' });
    const sampleTerritory = sample(StateInstance.availableTerritories);

    StateInstance.claimTerritory(sampleTerritory, player);
    expect(StateInstance.territories).to.deep.include({
      [sampleTerritory]: {
        armies: 1,
        color: '#fff',
        playerID: player.id
      }
    });

    StateInstance.territoryLosesArmies(sampleTerritory, 1);
    expect(StateInstance.territories).to.deep.include({
      [sampleTerritory]: {
        armies: 0,
        color: '#fff',
        playerID: player.id
      }
    });
  });

  it('StateInstance.clearTerritoryClaim():', () => {
    StateInstance.resetTerritories();

    const player = createDummyPlayer({ id: 'getRandomPlayerTerritory' });
    const sampleTerritory = sample(StateInstance.availableTerritories);

    StateInstance.claimTerritory(sampleTerritory, player);

    const playerTerritoriesBefore = StateInstance.getPlayerTerritories(player.id);
    expect(playerTerritoriesBefore).to.deep.equal([sampleTerritory]);

    StateInstance.clearTerritoryClaim(sampleTerritory);

    const playerTerritoriesAfter = StateInstance.getPlayerTerritories(player.id);
    expect(playerTerritoriesAfter).to.deep.equal([]);
  });

  it('StateInstance.takeOverTerritory():', () => {
    StateInstance.resetTerritories();

    const defendingTerritory = sample(StateInstance.availableTerritories);
    const attackingPlayer = StateInstance.createPlayer({ id: 'attackingPlayer' });
    const defendingPlayer = createDummyPlayer({ id: 'defendingPlayer' });

    StateInstance.claimTerritory(defendingTerritory, defendingPlayer);

    // armies must be at zero to take over territory
    StateInstance.territoryLosesArmies(defendingTerritory, 1);
    StateInstance.takeOverTerritory(defendingTerritory, attackingPlayer.id, 3);

    const territory = StateInstance.getTerritory(defendingTerritory);
    expect(territory).to.deep.equal({
      playerID: attackingPlayer.id,
      color: attackingPlayer.color,
      armies: 3
    });
  });

  it('StateInstance.reinforceTerritory():', () => {
    StateInstance.resetTerritories();

    const player = StateInstance.createPlayer({ id: 'getRandomPlayerTerritory' });
    const sampleTerritory = sample(StateInstance.availableTerritories);

    StateInstance.claimTerritory(sampleTerritory, player);
    StateInstance.reinforceTerritory(sampleTerritory, player);

    const territory = StateInstance.getTerritory(sampleTerritory);
    expect(territory).to.deep.equal({
      playerID: player.id,
      color: player.color,
      armies: 2
    });
  });

  it('StateInstance.reinforceTerritoryFromAnother():', () => {
    StateInstance.resetTerritories();

    const player = createDummyPlayer({ id: 'getRandomPlayerTerritory' });
    const reinforceFrom = sample(StateInstance.availableTerritories);
    const reinforceTo = sample(StateInstance.availableTerritories);

    StateInstance.claimTerritory(reinforceFrom, player);
    StateInstance.reinforceTerritory(reinforceFrom, player);
    StateInstance.claimTerritory(reinforceTo, player);

    StateInstance.reinforceTerritoryFromAnother(player, {
      reinforceFrom,
      reinforceTo,
      amount: 1
    });

    const resultTerritory = StateInstance.getTerritory(reinforceTo);
    expect(resultTerritory).to.deep.equal({
      playerID: player.id,
      color: player.color,
      armies: 2
    });
  });

  it('StateInstance.continentOwnership:', () => {
    StateInstance.resetTerritories();

    const player = createDummyPlayer({ id: 'continentOwnership' });
    const sampleContinentKey = sample(Object.keys(StateInstance.continents));
    const sampleContinentTerritories = StateInstance.continents[sampleContinentKey];

    sampleContinentTerritories.forEach((territory) => {
      StateInstance.claimTerritory(territory, player);
    });

    const continentOwnership = StateInstance.checkContinentOwnership(player);
    expect(continentOwnership).to.deep.equal([sampleContinentKey]);
  });
});
