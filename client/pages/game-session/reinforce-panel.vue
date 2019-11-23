<template>
  <div
    v-if="isShow"
    class="reinforce-panel"
  >
    <div class="reinforce-panel__info">
      <span class="reinforce-panel__id">
        From: {{ reinforceConfig.reinforceFrom }}
      </span>
      <span class="reinforce-panel__id">
        To: {{ reinforceConfig.reinforceTo }}
      </span>
      <span class="reinforce-panel__amount">
        Amount:
        <input
          v-model="amount"
          type="text"
        >
        <game-button
          @click="confirmReinforcement"
        >
          Confirm
        </game-button>
      </span>
    </div>
  </div>
</template>

<script>
import gameButton from '../../components/button/button.vue';

export default {
  name: 'ReinforcePanel',
  components: { gameButton },
  data: () => ({
    amount: 1
  }),
  computed: {
    isShow() {
      return this.$store.state.game.showReinforceUI;
    },
    reinforceConfig() {
      return this.$store.state.game.reinforceConfig;
    }
  },
  methods: {
    confirmReinforcement() {
      const reinforceConfig = {
        ...this.reinforceConfig,
        amount: this.amount
      };

      const highlights = [
        reinforceConfig.reinforceFrom,
        reinforceConfig.reinforceTo
      ].filter(item => Boolean(item));

      this.$emit('highlights-to-remove', highlights);
      this.$store.dispatch('REINFORCE_CONFIRM', reinforceConfig);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './reinforce-panel.scss';
</style>
