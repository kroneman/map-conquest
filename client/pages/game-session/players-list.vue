<template>
  <div>
    <h3
      v-if="!hideTitle"
      class="players-list__title"
    >
      Players
    </h3>
    <game-button
      v-if="!hideToggle"
      @click="togglePlayerList"
    >
      Hide Player List ({{ players.length }})
    </game-button>
    <ul
      v-if="showPlayerList"
      class="players-list"
    >
      <li
        v-for="player in players"
        :key="player.id"
        class="players-list__item"
      >
        <span class="players-list__info">{{ player.name || player.id }}</span>
        <span
          class="players-list__color-box"
          :style="`background: ${player.color || '#fff'}`"
        />
        <span class="players-list__info">{{ player.reinforcements }}</span>
        <span
          v-if="currentPlayerTurn && player.id === currentPlayerTurn.id"
          class="players-list__info"
        >
          *
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import gameButton from '../../components/button/button.vue';

export default {
  name: 'PlayersList',
  components: { gameButton },
  props: {
    currentPlayerTurn: {
      type: Object,
      required: false,
      default: () => ({ id: '' })
    },
    players: {
      type: Array,
      required: true
    },
    hideToggle: {
      type: Boolean,
      default: false
    },
    hideTitle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPlayerList: true
    };
  },
  methods: {
    togglePlayerList() {
      this.showPlayerList = !this.showPlayerList;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './players-list.scss';
</style>
