<template>
  <page>
    <navigation />
    <div class="view-games">
      <div class="view-games__content">
        <h3 class="text-center">
          Available Games
        </h3>
        <ul
          v-if="hasGames"
          class="view-games__list"
        >
          <li
            v-for="(game) in games"
            :key="game.id"
            class="view-games__list-item"
          >
            <div class="text-left view-games__list-info">
              <span>{{ game.id }}</span>
              <span>{{ game.players }} player(s)</span>
              <input-checkbox
                v-model="joinAsSpectator"
                name="spectate"
                type="checkbox"
                label="Join as Spectator"
              />
            </div>
            <span
              class="view-games__list-button"
              @click="selectGame(game.id)"
            >Join Game</span>
          </li>
        </ul>

        <div
          v-if="!hasGames"
          class="text-center"
        >
          <h3>There are no Active games</h3>
        </div>
        <router-link
          to="/create-game"
          class="view-games__create-game"
        >
          <game-button>
            Create Game
          </game-button>
        </router-link>
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
import navigation from '../../components/navigation/navigation.vue';
import gameMap from '../../components/map/map.generated.vue';

import gameButton from '../../components/button/button.vue';
import inputCheckbox from '../../components/input-checkbox/input-checkbox.vue';

export default {
  name: 'ViewGames',
  components: {
    page,
    navigation,
    gameMap,
    gameButton,
    inputCheckbox
  },
  data: () => ({
    isLoading: false,
    selectedGame: null,
    joinAsSpectator: false
  }),
  computed: {
    games() {
      return this.$store.state.game.gamesList;
    },
    hasGames() {
      return this.games && this.games.length > 0;
    },
    currentGame() {
      return this.$store.state.game.currentGame.id;
    }
  },
  created() {
    this.$store.dispatch('LIST_GAMES');
    this.$watch(
      () => this.currentGame,
      () => {
        this.$router.push({ name: 'gameLobby' });
      }
    );
  },
  methods: {
    listGames() {
      this.$store.dispatch('LIST_GAMES');
    },
    selectGame(gameId) {
      this.selectedGame = gameId;
      this.joinGame();
    },
    joinGame() {
      if (!this.selectedGame) {
        return;
      }

      this.$store.dispatch('JOIN_GAME', {
        selectedGame: this.selectedGame,
        joinAsSpectator: this.joinAsSpectator
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './view-games.scss';
</style>
