const BotConnection = require('./connection');
const logger = require('./logger');

/**
 * Spectator process
 * Doesn't play the game itself but creates the game and spectates
 */
module.exports = class Spectator extends BotConnection {
  constructor(props) {
    super(props);

    this.isGameCreated = false;

    this.messages = {
      createGameSuccess: 'Successfully Created a game',
      createGameError: 'Error Creating a game'
    };

    this.events = {
      listGames: 'list-games',
      createGame: 'create-game',
      createGameSuccess: 'create-game-success',
      createGameError: 'create-game-error'
    };

    this.handlers = {
      [this.events.listGames]: this.onListGames,
      [this.events.createGameSuccess]: this.onCreateGameSuccess,
      [this.events.createGameError]: this.onCreateGameError
    };

    this.createGame = config => this.sleep(
      () => this.socket.emit(this.events.createGame, config)
    );
  }

  onListGames(response) {
    if (this.isGameCreated) {
      return;
    }

    logger.info('onListGames: %o', response);
    const config = {
      name: 'botsareautonomous',
      joinAsSpectator: true
    };
    this.createGame(config);
    this.isGameCreated = true;
  }

  onCreateGameSuccess() {
    logger.info('onCreateGameSuccess: %s', this.messages.createGameSuccess);
  }

  onCreateGameError() {
    logger.warn('onCreateGameError: %s', this.messages.createGameError);
  }
};
