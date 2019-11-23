<template>
  <div class="input-select__wrapper">
    <select
      :value="value"
      class="input-select"
      @input="updateInput"
    >
      <option
        v-for="option in options"
        :key="option"
        :value="option"
        :selected="privateValue === value"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'InputSelect',
  props: {
    value: { type: String, default: '' },
    options: { type: Array, default: () => [] }
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
@import './input-select.scss';
</style>
