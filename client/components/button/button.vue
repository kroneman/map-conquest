<template>
  <button
    class="button"
    :class="buttonStyles()"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    wordWrap: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String,
      required: false,
      default: 'primary'
    }
  },
  methods: {
    buttonStyles() {
      return [
        this.variantClass(),
        this.wordWrapClass()
      ].filter(c => c.length > 0).join(' ');
    },
    variantClass() {
      return this.variant ? `button--${this.variant}` : '';
    },
    wordWrapClass() {
      return this.wordWrap ? '' : 'button--no-wrap';
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./button.scss";
</style>
