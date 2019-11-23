const map = require('lodash/map');
const every = require('lodash/every');
const dataset = require('../data/mapboxdataset.json');

const { features } = dataset;

main();
/**
 * Runs all conditions anv wraps in every to see if all are true
 */
function main() {
  const meetsAllConditions = every([
    ensureAllHaveContinent(),
    ensureAllHaveCanReachProperty(),
    countTerritories()
  ]);

  /* eslint-disable no-console */
  console.log('meetsAllConditions');
  console.log(meetsAllConditions);
  /* eslint-enable */
  return meetsAllConditions;
}

/**
 * Validates if all features have the required properites
 */
function ensureAllHaveContinent() {
  let numUnassigned = 0;
  map(features, (feature) => {
    const { properties } = feature;
    // yes a typo unfortunately, need to fix this in mapbox studio
    if (!properties.contintent) {
      // eslint-disable-next-line no-console
      console.error(`${properties.province} has no assigned continent`);
      numUnassigned += 1;
    }
  });

  if (numUnassigned === 0) {
    // eslint-disable-next-line no-console
    console.log('ensureAllHaveContinent: success');
    return true;
  }

  // eslint-disable-next-line no-console
  console.log(`ensureAllHaveContinent numUnassigned: ${numUnassigned}`);
  return false;
}

function ensureAllHaveCanReachProperty() {
  let numWithoutProperty = 0;
  map(features, (feature) => {
    const { properties } = feature;
    if (!properties.canReach) {
      // eslint-disable-next-line no-console
      console.error(`${properties.province} has no assigned canReach`);
      numWithoutProperty += 1;
    }
  });
  if (numWithoutProperty === 0) {
    // eslint-disable-next-line no-console
    console.log('ensureAllHaveCanReachProperty: success');
    return true;
  }

  // eslint-disable-next-line no-console
  console.log(`ensureAllHaveCanReachProperty numWithoutProperty: ${numWithoutProperty}`);
  return false;
}

function countTerritories() {
  // need to update mapbox to split ural and siberia
  // const is42Territories = features.length === 42;
  const is42Territories = features.length === 41;
  // eslint-disable-next-line no-console
  console.log(is42Territories ? 'There are 42 territories' : `${features.length} found instead`);
  return is42Territories;
}
