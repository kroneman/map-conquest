<template>
  <div class="input-checkbox__wrapper">
    <input
      :id="name"
      class="input-checkbox"
      type="checkbox"
      :name="name"
      :value="value"
      :checked="value"
      @input="updateInput"
    >
    <label
      v-if="label"
      class="input-checkbox__label"
      :for="name"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'InputCheckbox',
  props: {
    name: { type: String, required: true },
    value: { type: Boolean, default: false },
    label: { type: String, default: null }
  },
  computed: {
    privateValue() {
      return this.value;
    }
  },
  methods: {
    updateInput(e) {
      const { checked } = e.target;
      this.$emit('input', checked);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './input-checkbox.scss';
</style>
