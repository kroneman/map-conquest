<template>
  <page>
    <navigation />
    <div class="settings">
      <div class="settings__title">
        Map Conquest
      </div>
      <div class="text-center">
        Settings
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
  name: 'Settings',
  components: { page, gameMap, navigation }
};
</script>

<style lang="scss" scoped>
@import './settings.scss';
</style>
