import map from 'lodash/map';
import find from 'lodash/find';
import connect from '../services/websockets';

const errorMessage = {
  gameNameNotUnique: name => `${name}: game name is not unique, enter a different game name`
};

// events emitted on and listened to
const events = {
  createGame: 'create-game',
  listGames: 'list-games',
  joinGame: 'join-game',
  leaveGame: 'leave-game',
  startGame: 'start-game',
  getGameDetails: 'get-game-details',
  requestBotPlayer: 'request-bot-player',
  gameVictory: 'game-victory',
  updatePlayer: 'update-player',
  updatePlacementConfig: 'update-placement-config',
  updateReinforcementConfig: 'update-reinforcement-config',
  chatMessageSent: 'chat-send-message',
  territoryClicked: 'territory-clicked',
  attackTerritory: 'attack-territory',
  attackTerritorySuccess: 'attack-territory-success',
  endTurnAttack: 'turn-end-attack',
  turnReinforceTerritory: 'turn-reinforce-territory',
  endTurn: 'turn-end',
  gameErrorNotification: 'game-error-notification'
};

// events only listened to
const listeners = {
  connect: 'connect',
  joinGameSuccess: 'join-game-success',
  createGameSuccess: 'create-game-success',
  createGameError: 'create-game-error',
  startGameError: 'start-game-error',
  gameDetails: 'game-details',
  updatePlayerTurn: 'update-turn'
};

const resetReinforceConfig = {
  reinforceFrom: null,
  reinforceTo: null,
  ammount: 0
};

const resetAttackConfig = {
  attackFrom: null,
  attackTo: null
};

const socket = connect();
export default {
  // if the application grows start namespacing modules
  // namespaced: true,
  state: {
    gameVictory: null,
    playersTurn: null,
    currentPlayerTurn: null,
    turnAttackEnded: false,
    turnReinforceEnded: false,
    showReinforceUI: false,
    reinforceConfig: {
      ...resetReinforceConfig
    },
    attackConfig: {
      ...resetAttackConfig
    },
    gameInSession: false,
    startGameError: '',
    playerID: null,
    gamesList: [],
    createGameError: null,
    currentGame: {},
    notification: null
  },
  getters: {
    isTurnAttack({
      playersTurn,
      playerID,
      currentGame,
      turnAttackEnded
    }) {
      if (turnAttackEnded) {
        return false;
      }

      const { isInitialPlacementFinished, players } = currentGame;
      const player = find(players, p => p.id === playerID);
      const playerHasReinforced = Boolean(player) && player.reinforcements < 1;
      return playersTurn && isInitialPlacementFinished && playerHasReinforced;
    },
    isTurnDraft({ currentGame, playerID, playersTurn }) {
      const { players } = currentGame;
      const player = find(players, p => p.id === playerID);
      return playersTurn && Boolean(player) && player.reinforcements > 0;
    },
    isTurnReinforce({ playersTurn, currentGame, turnReinforceEnded }, getters) {
      const { isInitialPlacementFinished } = currentGame;
      if (!isInitialPlacementFinished || turnReinforceEnded) {
        return false;
      }

      const { isTurnAttack, isTurnDraft } = getters;
      const isTurnReinforce = playersTurn && !isTurnAttack && !isTurnDraft;
      return isTurnReinforce;
    }
  },
  mutations: {
    notification: (state, message) => { state.notification = message; },
    showReinforceUI: (state, isShow) => { state.showReinforceUI = isShow; },
    playerID: (state, playerID) => { state.playerID = playerID; },
    gameInSession: (state, isInSession) => { state.gameInSession = isInSession; },
    startGameError: (state, message) => { state.startGameError = message; },
    turnAttackEnded: (state, isEnded) => { state.turnAttackEnded = isEnded; },
    turnReinforceEnded: (state, isEnded) => { state.turnReinforceEnded = isEnded; },
    playersTurn(state, currentPlayer) {
      const isPlayersTurn = (currentPlayer.id === state.playerID);
      state.currentPlayerTurn = currentPlayer;
      state.playersTurn = isPlayersTurn;

      // reset turn attack ended at beginning of turn
      if (isPlayersTurn) {
        state.turnAttackEnded = false;
      }
    },
    updateGamesList(state, newGamesList) {
      state.gamesList = [
        ...newGamesList
      ];
    },
    activeGame(state, gameId) {
      state.currentGame = {
        id: gameId
      };
    },
    gameDetails(state, gameDetails) {
      state.currentGame = {
        ...state.currentGame,
        ...gameDetails
      };
    },
    createGameError(state, errorMsg) {
      state.createGameError = {
        isError: true,
        errorMsg
      };
    },
    reinforceConfig(state, reinforceConfig) {
      state.reinforceConfig = {
        ...state.reinforceConfig,
        ...reinforceConfig
      };
    },
    attackConfig(state, attackConfig) {
      state.attackConfig = {
        ...state.attackConfig,
        ...attackConfig
      };
    },
    gameVictory(state, playerId) {
      const { currentGame } = state;
      const player = find(currentGame.players, p => p.id === playerId);
      state.gameVictory = player;
    }
  },
  // trigger events to the server here
  actions: {
    LIST_GAMES() {
      socket.emit(events.listGames);
    },
    JOIN_GAME(localStore, { selectedGame, joinAsSpectator }) {
      socket.emit(events.joinGame, { selectedGame, joinAsSpectator });
    },
    LEAVE_GAME({ commit }) {
      commit('activeGame', null);
      commit('gameInSession', false);
      socket.emit(events.leaveGame);
    },
    REQUEST_BOT() {
      socket.emit(events.requestBotPlayer);
    },
    CREATE_GAME(localStore, gameSettings) {
      socket.emit(events.createGame, gameSettings);
    },
    START_GAME(localStore, game) {
      socket.emit(events.startGame, game.id);
    },
    GET_GAME_DETAILS(localStore, gameName) {
      socket.emit(events.getGameDetails, gameName);
    },
    UPDATE_PLAYER(localStore, playerName) {
      socket.emit(events.updatePlayer, playerName);
    },
    UPDATE_PLACEMENT_OPTION(localStore, placement) {
      socket.emit(events.updatePlacementConfig, placement);
    },
    UPDATE_REINFORCEMENT_OPTION(localStore, reinforcementOption) {
      socket.emit(events.updateReinforcementConfig, reinforcementOption);
    },
    CHAT_SEND_MESSAGE(localStore, message) {
      socket.emit(events.chatMessageSent, message);
    },
    TERRITORY_CLICKED(localStore, territoryID) {
      socket.emit(events.territoryClicked, territoryID);
    },
    ATTACK_TERRITORY({ commit }, payload) {
      socket.emit(events.attackTerritory, payload);
      commit('attackConfig', resetAttackConfig);
    },
    END_TURN_ATTACK({ commit }) {
      commit('turnAttackEnded', true);
      commit('turnReinforceEnded', false);

      socket.emit(events.endTurnAttack);
    },
    REINFORCE_TERRITORY_UI({ commit }) {
      commit('showReinforceUI', true);
    },
    REINFORCE_CONFIRM(localStore, reinforceConfig) {
      socket.emit(events.turnReinforceTerritory, reinforceConfig);
    },
    END_TURN({ commit }) {
      commit('showReinforceUI', false);
      socket.emit(events.endTurn);
    },
    START_SOCKET_LISTENERS({ commit }) {
      socket.on(listeners.connect, () => commit('playerID', socket.id));
      socket.on(events.listGames, ({ games }) => commit('updateGamesList', games));
      socket.on(listeners.createGameError, name => commit('createGameError', errorMessage.gameNameNotUnique(name)));
      socket.on(listeners.createGameSuccess, gameName => commit('activeGame', gameName));
      socket.on(listeners.joinGameSuccess, gameName => commit('activeGame', gameName));
      socket.on(listeners.startGameError, message => commit('startGameError', message));
      socket.on(events.startGame, () => {
        commit('gameVictory', null);
        commit('gameInSession', true);
        commit('startGameError', '');
      });

      socket.on(events.attackTerritorySuccess, (payload) => {
        const { attackerReinforceConfig, gameDetails } = payload;
        const { attackerTerritory, defendingTerritory } = attackerReinforceConfig;
        commit('showReinforceUI', true);
        commit('gameDetails', gameDetails);
        commit('reinforceConfig', {
          reinforceFrom: attackerTerritory.id,
          reinforceTo: defendingTerritory.id
        });
      });

      socket.on(events.gameErrorNotification, (message) => {
        commit('notification', message);
      });

      socket.on(events.turnReinforceTerritory, () => {
        commit('reinforceConfig', resetReinforceConfig);
        commit('showReinforceUI', false);
        commit('turnReinforceEnded', true);
      });

      socket.on(listeners.gameDetails, (gameDetails) => {
        const { players } = gameDetails;
        const mappedPlayers = map(players, player => ({
          ...player,
          isYou: player.id === socket.id
        }));

        const updatedGameDetails = {
          ...gameDetails,
          players: mappedPlayers
        };
        commit('gameDetails', updatedGameDetails);
      });

      socket.on(listeners.updatePlayerTurn, (currentPlayerTurn) => {
        commit('playersTurn', currentPlayerTurn);
      });

      socket.on(
        events.gameVictory,
        playerId => commit('gameVictory', playerId)
      );
    }
  }
};