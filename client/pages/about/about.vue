<template>
  <page>
    <navigation />
    <div class="about">
      <div class="about__title text-center">
        Map Conquest
      </div>
      <div>
        About Page
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
import navigation from '../../components/navigation/navigation.vue';

export default {
  name: 'CreateGame',
  components: { page, gameMap, navigation }
};
</script>

<style lang="scss" scoped>
@import './about.scss';
</style>
