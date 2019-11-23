<template>
  <div>
    <div class="chat">
      <div class="chat__messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
        >
          <span :style="`color: ${message.player.color || `#000`}`">
            {{ message.player.name || message.player.id }}: {{ message.message }}
          </span>
        </div>
      </div>
      <form
        class="chat__inputs"
        @submit="sendMessage"
      >
        <input
          v-model="messageInput"
          class="chat__message-input"
          type="text"
        >
        <button
          type="submit"
          class="chat__message-submit"
        >
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  components: { },
  data: () => ({
    messageInput: ''
  }),
  computed: {
    messages() {
      return this.$store.state.game.currentGame.chat;
    }
  },
  methods: {
    sendMessage(e) {
      e.preventDefault();
      if (!this.messageInput) {
        return;
      }

      this.$store.dispatch('CHAT_SEND_MESSAGE', this.messageInput);
      this.messageInput = '';
    }
  }
};
</script>

<style lang="scss" scoped>
@import './chat.scss';
</style>
