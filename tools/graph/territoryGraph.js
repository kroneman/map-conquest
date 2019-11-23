const path = require('path');
const GraphWithShortestPath = require('./graphWithPath');

const INPUT_PATH = path.resolve(__dirname, '../../data/gameterritorylist.json');

// eslint-disable-next-line import/no-dynamic-require
const { territoryGraph } = require(INPUT_PATH);
const territoryGraphStructure = new GraphWithShortestPath();

main();

async function main() {
  await addNodes();
  await addConnections();

  const nodeList = territoryGraphStructure.nodeList();
  const results = nodeList.map((item) => {
    const from = nodeList[0];
    const pathFinder = territoryGraphStructure.shortestPath(from, item);
    return {
      from,
      to: item,
      path: pathFinder,
      distance: pathFinder.length
    };
  });

  return results.sort((a, b) => a.distance - b.distance);
}

/**
 * Add territory nodes to graph structure
 */
async function addNodes() {
  const territoryKeys = Object.keys(territoryGraph);
  let lenTerritories = territoryKeys.length;
  while (lenTerritories) {
    lenTerritories -= 1;
    const territoryKey = territoryKeys[lenTerritories];
    territoryGraphStructure.add(territoryKey);
  }
}

/**
 * Add connections between nodes
 */
async function addConnections() {
  const territoryKeys = Object.keys(territoryGraph);
  let lenTerritories = territoryKeys.length;
  while (lenTerritories) {
    lenTerritories -= 1;
    const territoryKey = territoryKeys[lenTerritories];
    const connections = territoryGraph[territoryKey];
    connections.forEach(
      (connectionKey) => {
        if (territoryGraphStructure.hasConnection(territoryKey, connectionKey)) {
          // eslint-disable-next-line
          console.log(`${territoryKey} already has connection to ${connectionKey}`);
          return;
        }

        territoryGraphStructure.addConnection(territoryKey, connectionKey);
      }
    );
  }
}
