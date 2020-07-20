const Graph = require('./graph');

const reduceToObject = (result, item) => ({ ...result, [item]: true });
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const uniq = (arr = []) => Object.keys(arr.reduce(reduceToObject, {}));

class GraphWithShortestPath extends Graph {
  /**
   * Shortest path using an un-optimized version of dijkstra's shortest path solution
   * https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
   * @param {string} from startingNode
   * @param {string} to endingNode
   * @returns {array<string>} shortest path between from and to in graph
   */
  shortestPath(from, to) {
    const fromNode = this.get(from);
    const edges = Object.keys(fromNode);
    const visitedDistance = { [from]: 0 };
    this.markNextDistance({
      edges,
      lastDistance: 0
    }, visitedDistance);

    return this.backTrace(from, to, [to], visitedDistance);
  }

  /**
   * !!recursive
   * !!has side effects
   *
   * Marks nodes as at a certain distance from the starting node
   * Each time a new set of edges are retrieved
   * and filtered against visitedDistance keys
   * @param {{ edges: array, lastDistance: number }}
   * @param {{ [string]: number }} visitedDistance
   * @returns {void}
   */
  markNextDistance({ edges, lastDistance }, visitedDistance) {
    let lenEdges = edges.length;
    const currentDistance = lastDistance + 1;
    while (lenEdges) {
      lenEdges -= 1;
      const currentEdge = edges[lenEdges];
      if (!has(visitedDistance, currentEdge)) {
        // eslint-disable-next-line no-param-reassign
        visitedDistance[currentEdge] = currentDistance;
      }
    }

    const visitedKeys = Object.keys(visitedDistance);
    const visitedFilter = item => !visitedKeys.includes(item);
    const flattenNodeEdges = (result, edge) => [
      ...result,
      ...Object.keys(this.get(edge))
    ];
    const newEdges = uniq(
      edges.reduce(flattenNodeEdges, [])
        .filter(visitedFilter)
    );

    if (newEdges.length < 1) {
      return;
    }

    this.markNextDistance({
      edges: newEdges,
      lastDistance: currentDistance
    }, visitedDistance);
  }

  /**
   * !!recursive
   * !!has side effects
   *
   * Uses visitedDistance object to find its shortest distance back
   * from the endingNode to the startingNode
   * @param {string} from startingNode
   * @param {string} to endingNode
   * @param {array<string>} path and eventual result
   * @param {{ [string]: number }} visitedDistance object with reference distances from startingNode
   * @returns {array<string>} shortest path
   */
  backTrace(from, to, path = [to], visitedDistance) {
    const edges = Object.keys(this.get(to));
    if (edges.includes(from)) {
      path.unshift(from);
      return path;
    }

    const shortestEdge = (result = undefined, item) => {
      if (!result) {
        return item;
      }

      if (visitedDistance[result] < visitedDistance[item]) {
        return result;
      }
      return item;
    };

    const isAlongShortestPath = edges.reduce(shortestEdge);
    path.unshift(isAlongShortestPath);
    return this.backTrace(from, isAlongShortestPath, path, visitedDistance);
  }
}

module.exports = GraphWithShortestPath;
