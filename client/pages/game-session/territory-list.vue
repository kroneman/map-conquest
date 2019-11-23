<template>
  <div>
    <h3 class="territory-list__title">
      Territories
    </h3>
    <game-button @click="toggleTerritoryList">
      Toggle Territory List ({{ territories.length }})
    </game-button>
    <ul v-if="showTerritoryList">
      <li
        v-for="territory in territories"
        :key="territory"
      >
        {{ territory }}
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
    territories: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showTerritoryList: false
    };
  },
  methods: {
    toggleTerritoryList() {
      this.showTerritoryList = !this.showTerritoryList;
    }
  }

};
</script>

<style lang="scss" scoped>
@import './territory-list.scss';
</style>
