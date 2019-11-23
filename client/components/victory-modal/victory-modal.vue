<template>
  <div
    v-if="isShowModal"
    class="victory-modal"
  >
    <h4 class="victory-modal__text">
      {{ gameVictoryPlayer.name }} has won the game!
    </h4>
    <game-button
      class="victory-modal__button"
      @click="confirmVictory"
    >
      Back to View Games
    </game-button>
  </div>
</template>

<script>
import gameButton from '../button/button.vue';

export default {
  name: 'VictoryModal',
  components: { gameButton },
  data: () => ({
    actionText: 'Confirm'
  }),
  computed: {
    gameVictoryPlayer() {
      return this.$store.state.game.gameVictory;
    },
    isShowModal() {
      return Boolean(this.gameVictoryPlayer);
    }
  },
  methods: {
    confirmVictory() {
      this.$router.push({ name: 'viewGames' });
    }
  }
};
</script>

<style lang="scss" scoped>
@import './victory-modal.scss';
</style>
