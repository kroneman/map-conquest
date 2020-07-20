const path = require('path');
const map = require('lodash/map');
const turf = require('@turf/turf');
const { writeJSON } = require('fs-extra');

const OUTPUT_PATH = path.resolve(__dirname, '../data/centers-of-mass.json');
const dataset = require('../data/mapbox-dataset.json');

const { features } = dataset;

main();
async function main() {
  const centersOfMass = addCenterOfMass(features);
  await writeJSON(OUTPUT_PATH, {
    type: 'FeatureCollection',
    features: centersOfMass
  });
}

/**
 * Validates if all features have the required properties
 */
function addCenterOfMass() {
  return map(features, (feature) => {
    // since kamchatka is partially on the other side of the map
    // center of mass puts the circle in the center of the map
    if (feature.properties.province !== 'kamchatka') {
      return turf.centerOfMass(feature, {
        labelFor: `${feature.properties.province}`
      });
    }

    return {
      type: 'Feature',
      properties: {
        labelFor: `${feature.properties.province}`
      },
      geometry: {
        type: 'Point',
        coordinates: [
          167,
          65
        ]
      }
    };
  });
}
