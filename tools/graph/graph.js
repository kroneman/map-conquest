const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Graph implemented with adjacency list stored as keys in object
// https://www.geeksforgeeks.org/implementation-graph-javascript/
class Graph {
  constructor() {
    this.storage = {};
    this.size = 0;
  }

  /**
   * @returns {array<string>} list of all nodes in storage
   */
  nodeList() {
    return Object.keys(this.storage);
  }

  /**
   * @param {string} value node
   * @returns {void}
   */
  add(value) {
    this.storage[value] = {};
    this.size += 1;
  }

  /**
   * @param {string} value node
   * @returns {void}
   */
  remove(value) {
    delete this.storage[value];
    this.size -= 1;
    const storageKeys = Object.keys(this.storage);
    let numStorageKeys = storageKeys.length;
    while (numStorageKeys) {
      numStorageKeys -= 1;
      const key = storageKeys[numStorageKeys];
      if (this.storage[key][value]) {
        delete this.storage[key][value];
      }
    }
  }

  /**
   * @param {string} value node
   * @returns {boolean}
   */
  contains(value) {
    return has(this.storage, value);
  }

  /**
   * @param {string} value node
   * @returns {{ [string] : boolean}}
   */
  get(key) {
    if (!this.contains(key)) {
      // eslint-disable-next-line no-console
      console.error(`${key} node does not exist in graph`);
      return null;
    }

    return this.storage[key];
  }

  /**
   * @param {string} from startingNode
   * @param {string} to endingNode
   * @returns {void}
   */
  addConnection(from, to) {
    this.storage[from][to] = true;
    this.storage[to][from] = true;
  }

  /**
   * @param {string} from startingNode
   * @param {string} to endingNode
   * @returns {void}
   */
  removeConnection(from, to) {
    delete this.storage[from][to];
    delete this.storage[to][from];
  }

  /**
   * @param {string} from node/vertice
   * @param {string} to node/vertice
   * @returns {boolean}
   */
  hasConnection(from, to) {
    return has(this.storage[from], to);
  }
}

module.exports = Graph;
