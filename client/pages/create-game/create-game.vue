<template>
  <page>
    <navigation />
    <div class="create-game">
      <h2 class="text-center">
        Create a new game
      </h2>
      <div class="create-game__content">
        <form @submit="createGame">
          <label for="name">Game Name</label>
          <div class="create-game__input-group">
            <input-text
              v-model="gameSetup.name"
              class="create-game__name-input"
              name="name"
              type="text"
              placeholder="name"
            />
            <game-button
              :word-wrap="false"
              type="submit"
            >
              Create Game
            </game-button>
          </div>
          <input-checkbox
            v-model="gameSetup.joinAsSpectator"
            name="spectate"
            type="checkbox"
            label="Spectate"
          />
          <div
            v-if="createGameError && createGameError.isError"
            class="create-game__error"
          >
            {{ createGameError.errorMsg }}
          </div>
        </form>
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
import gameButton from '../../components/button/button.vue';
import gameMap from '../../components/map/map.generated.vue';
import inputCheckbox from '../../components/input-checkbox/input-checkbox.vue';
import inputText from '../../components/input-text/input-text.vue';
import navigation from '../../components/navigation/navigation.vue';

export default {
  name: 'CreateGame',
  components: {
    page,
    gameButton,
    gameMap,
    inputCheckbox,
    inputText,
    navigation
  },
  data() {
    return {
      gameSetup: {
        name: 'bot',
        joinAsSpectator: false
      }
    };
  },
  computed: {
    settings() {
      return this.$store.state.game.settings;
    },
    createGameError() {
      return this.$store.state.game.createGameError;
    },
    currentGame() {
      return this.$store.state.game.currentGame.id;
    }
  },
  watch: {
    settings(newValue, oldValue) {
      if (newValue.createGameAsSpectator === oldValue.createGameAsSpectator) {
        return;
      }

      this.gameSetup = {
        ...this.gameSetup,
        joinAsSpectator: newValue.createGameAsSpectator
      };
    }
  },
  created() {
    this.$watch(
      () => this.currentGame,
      () => {
        this.$router.push({ name: 'gameLobby' });
      }
    );
  },
  methods: {
    createGame(e) {
      e.preventDefault();
      this.$store.dispatch('CREATE_GAME', this.gameSetup);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './create-game.scss';
</style>
