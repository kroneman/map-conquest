<template>
  <div
    class="input-number-slider"
    :class="`input-number-slider${cssScrollSnap ? `--scroll-snap` : '--js-scroll'}`"
  >
    <div
      class="input-number-slider__slider"
      @wheel="(e) => scrollHandler(e)"
    >
      <span class="input-number-slider__control input-number-slider__control--left">
        left
      </span>
      <ul
        ref="optionList"
        class="input-number-slider__options"
        :style="{
          left: `${scrollLeft}px`
        }"
      >
        <li class="input-number-slider__option input-number-slider__option--placeholder" />
        <li
          v-for="option in rangeList"
          ref="options"
          :key="option"
          class="input-number-slider__option"
          :class="{
            'is-active': isActiveValue(option)
          }"
          :value="option"
        >
          {{ option }}
        </li>
        <li class="input-number-slider__option input-number-slider__option--placeholder" />
      </ul>
      <span class="input-number-slider__control input-number-slider__control--right">
        right
      </span>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';

export default {
  name: 'InputNumberSlider',
  props: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    value: { type: Number, default: 0 }
  },
  data() {
    return {
      privateValue: this.min,
      scrollLeft: 0,
      distanceOnScroll: 30,
      cssScrollSnap: true,
      hasScrolled: false
    };
  },
  computed: {
    rangeList() {
      let current = this.min;
      const rangeList = [current];

      while (rangeList[rangeList.length - 1] < this.max) {
        rangeList.push(current += 1);
      }

      return rangeList;
    }
  },
  methods: {
    // when using () => instead of 'function'
    // the dynamic context of this doesn't get bound properly
    scrollHandler: debounce(function handleScroll() {
      if (this.cssScrollSnap) {
        this.$nextTick(this.onCssScrollSnap);
      }
    }, 0),
    onCssScrollSnap() {
      const { options } = this.$refs;
      const optionElementsInView = options.map(this.isInView);
      const firstElement = optionElementsInView.reduce(
        (result, current) => (current !== false ? current : result),
        false
      );

      const privateValue = firstElement && firstElement.value;
      // zero is falsey so check for it explicitly
      if (privateValue || privateValue === 0) {
        this.privateValue = privateValue;
      }
    },
    isInView(el) {
      const { optionList } = this.$refs;
      const leftPosition = el.offsetLeft - optionList.scrollLeft;
      // todo: get all three available elements to show up
      // currently only two of the three show up
      if (leftPosition > optionList.offsetWidth || leftPosition < 0) {
        return false;
      }

      return el;
    },
    isActiveValue(option) {
      return option === this.privateValue;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './input-number-slider.scss';
</style>
