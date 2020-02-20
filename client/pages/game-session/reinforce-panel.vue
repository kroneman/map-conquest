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
          :value="amount"
          type="text"
          @keyup="onKeyUp($event)"
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
import debounce from 'lodash/debounce';
import gameButton from '../../components/button/button.vue';

export default {
  name: 'ReinforcePanel',
  components: { gameButton },
  props: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 5 }
  },
  data() {
    return {
      amount: 0
    };
  },
  computed: {
    isShow() {
      return this.$store.state.game.showReinforceUI;
    },
    reinforceConfig() {
      return this.$store.state.game.reinforceConfig;
    }
  },
  methods: {
    onKeyUp: debounce(function keyUp(e) {
      e.preventDefault();
      const { value } = e.target;
      const currentValueString = (!value || value.length < 1) ? '0' : value;
      this.validateBounds(currentValueString);
    }, 100),
    validateBounds(number) {
      const parsedNumber = parseInt(number, 10);
      const isNaN = Number.isNaN(parsedNumber);
      if (isNaN) {
        this.setAmmount(this.min);
        return;
      }

      if (Math.min(parsedNumber, this.max) === this.max) {
        this.setAmmount(this.max);
        return;
      }

      if (Math.max(parsedNumber, this.min) === this.min) {
        this.setAmmount(this.min);
        return;
      }

      this.setAmmount(parsedNumber);
    },
    setAmmount(value) {
      if (this.amount === value) {
        this.$forceUpdate();
        return;
      }

      this.amount = value;
    },
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
