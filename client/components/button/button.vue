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
      const classHasLength = classFragment => classFragment.length > 0;
      return [
        this.variantClass(),
        this.wordWrapClass()
      ].filter(classHasLength).join(' ');
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
