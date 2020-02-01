const compose = require('lodash/fp/compose');

const logger = require('../logger');
const { NAMED_ROOM_NAMESPACE } = require('../constants');
const gameState = require('./state');

const ConnectionClass = require('../helpers/connections');
const Chat = require('./chat/chatConnection');
const Instance = require('./instance/instanceConnection');
const Player = require('./player/playerConnection');
const BotSpawner = require('./bots/botSpawnerMixin');

// see https://alligator.io/js/class-composition/
const combinedFunctionality = compose(
  Instance,
  Chat,
  Player,
  BotSpawner
);

/**
 * Connection handler for connections not assigned to a game instance yet
 */
class Game extends ConnectionClass {
  constructor(props) {
    super(props);

    this.events = {
      createGame: 'create-game',
      createGameSuccess: 'create-game-success',
      createGameError: 'create-game-error',
      joinGame: 'join-game',
      leaveGame: 'leave-game',
      joinGameSuccess: 'join-game-success',
      listGames: 'list-games',
      updateReinfocementConfig: 'update-reinfocement-config'
    };

    this.handlers = {
      [this.events.createGame]: this.createGame,
      [this.events.joinGame]: this.joinGame,
      [this.events.leaveGame]: this.leaveGame,
      [this.events.listGames]: this.listGames
    };
  }

  createGame(gameSettings) {
    logger.debug(this.events.createGame);

    const newGameID = `${NAMED_ROOM_NAMESPACE}:${gameSettings.name}`;
    if (!this.isGameNameUnique(newGameID)) {
      logger.debug(this.events.createGameError);
      this.socket.emit(this.events.createGameError, newGameID);
      return;
    }

    this.setConnectionToRoom(newGameID);
    this.listGames();

    // delete a pevious instance with the same name
    gameState.deleteGameInstance(newGameID);
    const gameInstance = gameState.getGameInstance(newGameID);
    this.addPlayerToGameInstance(gameInstance, gameSettings.joinAsSpectator);

    logger.debug(this.events.createGameSuccess);
    this.socket.emit(this.events.createGameSuccess, newGameID);
  }

  joinGame({ selectedGame, joinAsSpectator }) {
    const gameID = selectedGame;
    const gameInstance = gameState.getGameInstance(gameID);

    this.setConnectionToRoom(gameID);
    this.listGames();
    this.addPlayerToGameInstance(gameInstance, joinAsSpectator);

    this.socket.emit(this.events.joinGameSuccess, gameID);
  }

  leaveGame() {
    // wondering who should have this responsibility
    if (!this.gameID) {
      return;
    }

    const memberToRemove = {
      id: this.socket.id
    };

    const gameInstance = gameState.getGameInstance(this.gameID);
    const isGamePlayer = gameInstance.isPlayer(memberToRemove);
    if (isGamePlayer) {
      gameInstance.removePlayer(memberToRemove);
    }

    const isGameSpectator = gameInstance.isGameSpectator(memberToRemove);
    if (isGameSpectator) {
      gameInstance.removeSpectator(memberToRemove);
    }

    const stillHasSpectators = gameInstance.hasSpectators();
    const stillHasPlayers = gameInstance.hasPlayers;
    if (!stillHasSpectators && !stillHasPlayers) {
      gameState.deleteGameInstance(this.gameID);
    }

    const gameRoom = this.rooms[this.gameID];
    const connectionsInGame = gameRoom && gameRoom.sockets ? gameRoom.sockets : [];
    gameInstance.removeInactivePlayers(Object.keys(connectionsInGame));

    this.socket.to(this.gameID).emit(this.events.gameDetails, gameInstance);
    this.removeConnectionFromRoom(this.gameID);
    this.listGames();
  }

  /**
   * Emits a list of games to players in pre-game
   * Broadcasts to all users
   */
  listGames() {
    logger.debug(this.events.listGames);
    const filteredGames = this.filteredRooms();
    const gamesWithSpectators = filteredGames.map((game) => {
      const gameInstance = gameState.getGameInstance(game);
      return {
        spectators: gameInstance.spectators.length,
        ...game
      };
    });
    const payload = {
      games: gamesWithSpectators
    };

    this.emitBroadcast(this.events.listGames, payload);
  }

  /**
   * @param {Object} gameInstance to add user to
   * @param {Boolean} joinAsSpectator determines method to add player as
   */
  addPlayerToGameInstance(gameInstance, joinAsSpectator) {
    const player = { id: this.playerID };
    const addUserMethod = joinAsSpectator ? 'addSpectator' : 'addPlayer';
    gameInstance[addUserMethod](player);
  }
}

module.exports = combinedFunctionality(Game);
