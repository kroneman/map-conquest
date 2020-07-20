const path = require('path');
const has = require('lodash/has');
const map = require('lodash/map');
const trim = require('lodash/trim');
const filter = require('lodash/filter');
const fse = require('fs-extra');

const OUTPUT_PATH = path.resolve(__dirname, '../data/game-territory-list.json');
const dataset = require('../data/mapbox-dataset.json');

const { features } = dataset;

main();
async function main() {
  const territories = createTerritoryList();
  const continents = createTerritoryByContinent();
  const continentReinforcements = setReinforcementsForContinent(continents);
  const territoryGraph = createTerritoryGraph();
  const isTerritoryGraphValid = validateTerritoryGraph(territoryGraph);

  if (!isTerritoryGraphValid) {
    return;
  }

  await fse.writeJSON(OUTPUT_PATH, {
    territories,
    continents,
    continentReinforcements,
    territoryGraph
  });

  // eslint-disable-next-line no-console
  console.log(`Created territory lists object at ${OUTPUT_PATH}`);
}

/**
 * Validates if all features have the required properties
 * @param {*} features geoJSON from mapbox api downloaded using ./get-mapbox-dataset.js
 */
function createTerritoryList() {
  return map(features, feature => feature.properties.province);
}

/**
 * @returns {object} territories associated with continent key
 */
function createTerritoryByContinent() {
  const continents = {};
  map(features, (feature) => {
    const { continent, province } = feature.properties;
    if (!has(continents, continent)) {
      continents[continent] = [];
    }

    continents[continent].push(province);
  });

  return continents;
}

/**
 * @returns {Object} list of territories the territory key is connected to
 */
function createTerritoryGraph() {
  const territoryGraph = {};
  map(features, (feature) => {
    const { canReach, province } = feature.properties;
    if (!has(territoryGraph, province)) {
      const canReachListSplit = canReach.split(',');
      const canReachListTrimmed = map(canReachListSplit, item => trim(item));
      const canReachList = filter(canReachListTrimmed, listItem => listItem.length > 0);
      territoryGraph[province] = canReachList;
      return;
    }

    throw new Error(`Duplicate province found ${province}`);
  });

  return territoryGraph;
}

/**
 * Validate that when a territory can reach another the reverse is also possible
 * @param {object} territoryGraph created by createTerritoryGraph function
 * @returns {boolean}
 */
function validateTerritoryGraph(territoryGraph) {
  const territoryList = Object.keys(territoryGraph);
  const result = territoryList.map((territoryID) => {
    const reverseCantReach = [];
    const canReach = territoryGraph[territoryID];
    const isReverseCanReach = canReach.every(
      (territoryReachId) => {
        const reverseList = territoryGraph[territoryReachId];
        if (!reverseList) {
          // eslint-disable-next-line no-console
          console.error(`territoryReachId: ${territoryReachId} does not exist in territory graph, fix in ${territoryID}`);
          return false;
        }
        const reverseIncludesTerritoryID = territoryGraph[territoryReachId].includes(territoryID);
        if (!reverseIncludesTerritoryID) {
          reverseCantReach.push(territoryReachId);
        }
        return reverseIncludesTerritoryID;
      }
    );

    return {
      territoryID,
      isReverseCanReach,
      reverseCantReach
    };
  });

  const errors = result.filter(({ isReverseCanReach }) => !isReverseCanReach);
  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(errors);
    return false;
  }

  return true;
}

/**
 * @param {Object} continents territory list by continents
 * @returns {object} with continent id as key and number as value
 */
function setReinforcementsForContinent(continents) {
  const reinforcements = {
    africa: 3,
    europe: 5,
    asia: 7,
    australia: 2,
    'north-america': 5,
    'south-america': 2
  };

  map(Object.keys(continents), (continent) => {
    if (has(reinforcements, continent)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(`continent ${continent} has no reinforcement value`);
    reinforcements[continent] = 0;
  });

  return reinforcements;
}
