<template>
  <page>
    <div class="home">
      <div class="home__title">
        Map Conquest
      </div>
      <div class="home__menu">
        <ul>
          <router-link
            v-for="(menuItem) in menu"
            :key="menuItem.to"
            tag="li"
            :to="menuItem.to"
          >
            {{ menuItem.text }}
          </router-link>
        </ul>
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
import gameMap from '../../components/map/map.generated.vue';

export default {
  name: 'Home',
  components: { page, gameMap },
  data: () => ({
    menu: [
      {
        to: '/create-game',
        text: 'New Game'
      },
      {
        to: '/view-games',
        text: 'Join Game'
      },
      {
        to: '/settings',
        text: 'Settings'
      },
      {
        to: '/about',
        text: 'About'
      }
    ]
  })
};
</script>

<style lang="scss" scoped>
@import './home.scss';
</style>
