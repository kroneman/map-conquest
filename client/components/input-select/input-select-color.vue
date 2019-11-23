<template>
  <div class="input-select__wrapper">
    <div
      class="input-select-color__option input-select-color__currentValue"
      :style="`background: ${privateValue || '#fff'}`"
      @click="toggleOptions"
    />
    <ul
      v-if="isEditing"
      class="input-select-color__list"
    >
      <li
        v-for="option in options"
        :key="option"
        :value="option"
        :style="`background: ${option || '#fff'}`"
        :selected="privateValue === value"
        class="input-select-color__option"
        @click="selectOption(option)"
      />
    </ul>
  </div>
</template>

<script>
export default {
  name: 'InputSelectColor',
  props: {
    value: { type: String, default: null },
    options: { type: Array, default: null }
  },
  data: () => ({
    isEditing: false
  }),
  computed: {
    privateValue() {
      return this.value;
    }
  },
  methods: {
    toggleOptions() {
      this.isEditing = !this.isEditing;
    },
    selectOption(value) {
      this.$emit('input', value);
      this.isEditing = false;
    },
    updateInput(e) {
      const { value } = e.target;
      this.$emit('input', value);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './input-select.scss';
</style>
