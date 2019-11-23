<template>
  <page>
    <navigation />
    <div class="lobby">
      <div class="lobby__content">
        <div v-if="currentGame">
          <h2 class="text-center">
            Game Lobby: {{ currentGame.id }}
          </h2>
          <h3>Placement Mode:</h3>
          <lobby-input-select
            v-model="currentGame.placementMode"
            :options="currentGame.placementModeOptions"
            @confirm-edit="confirmEditPlacement"
          />

          <h3 v-show="showReinforcementOption">
            Reinforcement Mode:
          </h3>
          <lobby-input-select
            v-show="showReinforcementOption"
            v-model="currentGame.reinforcementMode"
            :options="currentGame.reinforcementModeOptions"
            @confirm-edit="confirmEditReinforcement"
          />

          <h3 class="lobby__players-title">
            <span>
              Players:
            </span>
            <span
              class="lobby__add-bot-button"
              @click="addBot"
            > Add Bot</span>
          </h3>
          <lobby-players
            :players="currentGame.players"
            :color-options="currentGame.colorOptions"
            @confirm-edit="confirmEditPlayer"
          />

          <h3>Chat</h3>
          <chat />

          <div class="lobby-actions">
            <game-button
              :word-wrap="false"
              @click="startGame"
            >
              Start Game
            </game-button>
            <div class="lobby-error-message">
              {{ startGameError }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <game-map
      :test-map="true"
      :animated-map="true"
    />
  </page>
</template>

<script>
import page from '../../components/page/page.vue';
import chat from '../../components/chat/chat.vue';
import gameButton from '../../components/button/button.vue';
import gameMap from '../../components/map/map.generated.vue';
import navigation from '../../components/navigation/navigation.vue';

import lobbyInputSelect from './lobby-input-select.vue';
import lobbyPlayers from './lobby-players.vue';

import withLeaveGameOnExit from '../mixins/withLeaveGameOnExit';

export default {
  name: 'GameLobby',
  components: {
    page,
    navigation,
    chat,
    gameButton,
    lobbyInputSelect,
    lobbyPlayers,
    gameMap
  },
  mixins: [withLeaveGameOnExit],
  data: () => ({
    gameSettings: {
      placementMode: ''
    }
  }),
  computed: {
    gameInSession() {
      return this.$store.state.game.gameInSession;
    },
    startGameError() {
      const { startGameError } = this.$store.state.game;
      return startGameError;
    },
    showReinforcementOption() {
      return this.currentGame.placementMode === 'automatic';
    },
    playerID() {
      return this.$store.state.game.playerID;
    },
    currentGame() {
      const { currentGame } = this.$store.state.game;
      // eslint-disable-next-line
      this.gameSettings.placementMode = currentGame.placementMode;
      return currentGame;
    }
  },
  created() {
    if (!(this.currentGame && this.currentGame.id)) {
      return;
    }

    this.$store.dispatch('GET_GAME_DETAILS', this.currentGame.id);
    this.$watch(
      () => this.gameInSession,
      (gameInSession) => {
        if (!gameInSession) {
          return;
        }

        this.$router.push({ name: 'gameSession' });
      }
    );
  },
  methods: {
    getGameDetails() {
      this.$store.dispatch('GET_GAME_DETAILS', this.currentGame.id);
    },
    confirmEditPlacement(mode) {
      this.$store.dispatch('UPDATE_PLACEMENT_OPTION', mode);
    },
    confirmEditReinforcement(mode) {
      this.$store.dispatch('UPDATE_REINFORCEMENT_OPTION', mode);
    },
    confirmEditPlayer(player) {
      this.$store.dispatch('UPDATE_PLAYER', player);
    },
    addBot() {
      this.$store.dispatch('REQUEST_BOT');
    },
    startGame() {
      // validate before starting
      this.$store.dispatch('START_GAME', this.currentGame);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './game-lobby.scss';
</style>
