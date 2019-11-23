<template>
  <div class="turn-phase__container">
    <div class="turn-phase">
      <div class="turn-phase__text">
        {{ turnPhase }}
        <button
          v-if="isTurnAttack"
          class="turn-phase__button"
          @click="endAttack"
        >
          End Attack
        </button>
        <button
          v-if="isTurnReinforce || isTurnPhasesFinished"
          class="turn-phase__button"
          @click="endTurn"
        >
          End Turn
        </button>
      </div>
      <ul class="turn-list">
        <li
          class="turn-list__item"
          :class="{ 'is-active': isTurnDraft }"
        />
        <li
          class="turn-list__item"
          :class="{ 'is-active': isTurnAttack }"
        />
        <li
          class="turn-list__item"
          :class="{ 'is-active': isTurnReinforce }"
        />
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TurnPhase',
  computed: {
    isTurnDraft() {
      return this.$store.getters.isTurnDraft;
    },
    isTurnAttack() {
      return this.$store.getters.isTurnAttack;
    },
    isTurnReinforce() {
      return this.$store.getters.isTurnReinforce;
    },
    isTurnPhasesFinished() {
      const { isTurnDraft, isTurnAttack, isTurnReinforce } = this;
      const { playersTurn } = this.$store.state.game;
      return playersTurn && !isTurnDraft && !isTurnAttack && !isTurnReinforce;
    },
    turnPhase() {
      if (this.isTurnDraft) {
        return 'Draft';
      }

      if (this.isTurnAttack) {
        return 'Attack';
      }

      if (this.isTurnReinforce) {
        return 'Reinforce';
      }

      if (this.isTurnPhasesFinished) {
        return 'No Actions Left';
      }

      return 'Opponents Turn';
    },
    attackConfig() {
      return this.$store.state.game.attackConfig;
    },
    reinforceConfig() {
      return this.$store.state.game.reinforceConfig;
    }
  },
  methods: {
    endAttack() {
      const { attackFrom, attackTo } = this.attackConfig;
      const highlights = [attackFrom, attackTo].filter(item => Boolean(item));
      this.$emit('highlights-to-remove', highlights);
      this.$store.dispatch('END_TURN_ATTACK');
    },
    endTurn() {
      const { reinforceFrom, reinforceTo } = this.reinforceConfig;
      const highlights = [reinforceFrom, reinforceTo].filter(item => Boolean(item));
      this.$emit('highlights-to-remove', highlights);
      this.$store.dispatch('END_TURN');
    }
  }
};
</script>

<style lang="scss" scoped>
@import './turn-phase.scss';
</style>
