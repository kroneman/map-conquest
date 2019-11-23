<template>
  <ul class="lobby-players-list">
    <li
      v-for="player in players"
      :id="player.id"
      :key="player.id"
      class="lobby-players-list__item"
    >
      <div
        v-if="isEditing && player.isYou"
        class="lobby-players-list__update"
      >
        <input
          v-model="playerName"
          :placeholder="player.id"
          type="text"
          @keyup.enter="confirmEdit(player.id)"
        >
        <input-select-color
          v-model="playerColor"
          :options="colorOptions"
          class="lobby-players-list__color-input"
        />
        <span class="lobby-players-list__edit">
          <span
            class="lobby-players-list__edit-cancel"
            @click="cancelEdit(player.id)"
          >Cancel</span>
          <span
            class="lobby-players-list__edit-confirm"
            @click="confirmEdit(player.id)"
          >Confirm</span>
        </span>
      </div>
      <div v-else>
        <span class="lobby-players-list__info">{{ player.name || player.id }}</span>
        <span
          class="lobby-players-list__color-box"
          :style="`background: ${player.color || '#fff'}`"
        />
        <span
          v-if="player.isYou"
          class="lobby-players-list__edit"
        >
          <span
            class="lobby-players-list__edit-button"
            @click="edit(player.id)"
          >Edit</span>
        </span>
      </div>
    </li>
  </ul>
</template>

<script>
import InputSelectColor from '../../components/input-select/input-select-color.vue';

export default {
  name: 'LobbyPlayers',
  components: {
    InputSelectColor
  },
  props: {
    players: {
      type: Array,
      default: () => []
    },
    colorOptions: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    playerName: '',
    playerColor: '',
    isEditing: false
  }),
  methods: {
    edit() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    confirmEdit() {
      const player = {};
      if (!this.playerName && !this.playerColor) {
        return;
      }

      if (this.playerName) {
        player.name = this.playerName;
      }

      if (this.playerColor) {
        player.color = this.playerColor;
      }

      this.$emit('confirm-edit', player);
      this.isEditing = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import './lobby-players.scss';
</style>
