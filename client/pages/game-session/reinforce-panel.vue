<template>
  <div
    v-show="isShow"
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
          ref="reinforceAmmountInput"
          :value="amount"
          type="text"
          @keyup="onKeyUp($event)"
          @keyup.enter="confirmReinforcement"
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
  watch: {
    isShow(newValue, prevValue) {
      if (!newValue || newValue === prevValue) {
        return;
      }

      this.$nextTick().then(() => {
        const { reinforceAmmountInput } = this.$refs;
        reinforceAmmountInput.focus();
      });
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
        this.setAmmount(this.reinforceConfig.min);
        return;
      }

      if (Math.min(parsedNumber, this.reinforceConfig.max) === this.reinforceConfig.max) {
        this.setAmmount(this.reinforceConfig.max);
        return;
      }

      if (Math.max(parsedNumber, this.reinforceConfig.min) === this.reinforceConfig.min) {
        this.setAmmount(this.reinforceConfig.min);
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
      // on confirm double check the amount
      // sometimes there is a lefover from a previous reinforce
      this.validateBounds(this.amount);
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
