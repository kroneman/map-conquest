<template>
  <div class="lobby-input">
    <div class="lobby-input__value">
      <span
        v-if="!isEditing"
        class="lobby-input__current"
      >
        {{ privateValue }}
      </span>
      <input-select
        v-if="isEditing"
        v-model="privateValue"
        :options="options"
      />
      <div class="lobby-input__edit">
        <span
          v-if="!isEditing"
          class="lobby-input__button"
          @click="edit"
        >{{ controlText.edit }}</span>
        <span
          v-if="isEditing"
          class="lobby-input__cancel"
          @click="cancelEdit"
        >{{ controlText.cancel }}</span>
        <span
          v-if="isEditing"
          class="lobby-input__confirm"
          @click="confirmEdit"
        >{{ controlText.confirm }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import InputSelect from '../../components/input-select/input-select.vue';

export default {
  name: 'LobbyInput',
  components: { InputSelect },
  props: {
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    privateValue: '',
    isEditing: false,
    controlText: {
      edit: 'Edit',
      cancel: 'Cancel',
      confirm: 'Confirm'
    }
  }),
  created() {
    this.$watch(
      () => this.value,
      (newVal, oldVal) => {
        if (newVal === oldVal) {
          return;
        }

        this.privateValue = newVal;
      }
    );
  },
  methods: {
    edit() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    confirmEdit() {
      this.$emit('confirm-edit', this.privateValue);
      this.isEditing = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './lobby-input-select.scss';
</style>
