<template>
  <div class="game-map">
    <!-- do not change!!, even whitespace, see // tools/geo-json-to-svg.js -->
    <replace-with-generated />
  </div>
</template>

<script>
import mapFunctionalityMixin from './map.withFunctionality';
import mapStateMixin from './map.withState';
import animationMixin from './map.withStrokeAnimations';

export default {
  name: 'SvgMap',
  // lifecycle events can be the same but be careful with methods that have the same name
  // only the last mixin in the array's methods will be used if there are name overlaps
  mixins: [mapFunctionalityMixin, mapStateMixin, animationMixin],
  props: {
    testMap: { type: Boolean, default: false },
    animatedMap: { type: Boolean, default: false }
  }
};
</script>

<style lang="scss">
@import "./map.scss";
</style>
