<template>
  <page>
    <div class="game-session">
      <div class="game-session__map">
        <game-map
          :test-map="isTestMap"
          :animated-map="isAnimatedMap"
        />
      </div>
    </div>
  </page>
</template>

<script>
import page from '../../components/page/page.vue';
import gameMap from '../../components/map/map.generated.vue';

export default {
  name: 'GameSession',
  components: {
    page, gameMap
  },
  data: () => ({
    isTestMap: true,
    isAnimatedMap: true
  })
};
</script>

<style lang="scss" scoped>
// keep similar to game
@import '../game-session/game-session.scss';
</style>
