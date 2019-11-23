<template>
  <div
    class="notification"
    :class="{ 'is-open' : isOpen }"
  >
    <div class="notification__message">
      {{ message }}
      <game-button @click="close">
        close
      </game-button>
    </div>
  </div>
</template>

<script>
import gameButton from '../button/button.vue';

export default {
  name: 'Notification',
  components: {
    gameButton
  },
  data: () => ({
    isOpen: false,
    openDuration: 1000, // in ms
    closeInterval: null
  }),
  computed: {
    message() {
      const { notification } = this.$store.state.game;
      return notification;
    }
  },
  created() {
    this.$watch(
      () => this.message,
      (newValue) => {
        const shouldBeOpen = Boolean(newValue);
        this.isOpen = shouldBeOpen;
      }
    );
  },
  methods: {
    close() {
      this.isOpen = false;
      this.$store.commit('notification', null);
    }
  }
};
</script>

<style lang="scss" scoped>
@import './notification.scss';
</style>
