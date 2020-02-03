<template>
  <page>
    <div class="game-session">
      <div class="game-session__map">
        <game-map
          :test-map="isTestMap"
          :animated-map="isAnimatedMap"
        />
      </div>
      <InputNumberSlider
        :min="4"
        :max="10"
      />
    </div>
  </page>
</template>

<script>
import page from '../../components/page/page.vue';
import gameMap from '../../components/map/map.generated.vue';
import InputNumberSlider from '../../components/input-number-slider/input-number-slider.vue';

export default {
  name: 'GameSession',
  components: {
    page, gameMap, InputNumberSlider
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
