<template>
  <div class="input-text__wrapper">
    <input
      class="input-text"
      type="text"
      :name="name"
      :value="value"
      @input="updateInput"
    >
  </div>
</template>

<script>
export default {
  name: 'InputText',
  props: {
    name: { type: String, required: true },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' }
  },
  computed: {
    privateValue() {
      return this.value;
    }
  },
  methods: {
    updateInput(e) {
      const { value } = e.target;
      this.$emit('input', value);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './input-text.scss';
</style>
