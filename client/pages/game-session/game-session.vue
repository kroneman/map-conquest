<template>
  <page>
    <div class="game-session">
      <div class="game-session__turn-phase">
        <turn-phase
          @highlights-to-remove="removeHighlight"
        />
      </div>
      <div
        v-if="!!numUnclaimedTerritories"
        class="game-session__unclaimed-territories"
      >
        Unclaimed Territories: {{ numUnclaimedTerritories }}
      </div>
      <players-list
        class="game-session__player-info"
        :players="currentGame.players"
        :current-player-turn="currentPlayerTurn"
        :hide-title="true"
        :hide-toggle="true"
      />
      <div
        class="game-session__map"
      >
        <game-map
          :highlights-to-remove="highlightsToRemove"
          @removed-highights="resetHighlightsFinished"
        />
      </div>
    </div>
    <notification-bar />
    <victory-modal />
    <reinforcePanel
      @highlights-to-remove="removeHighlight"
    />
  </page>
</template>

<script>
import page from '../../components/page/page.vue';
import gameMap from '../../components/map/map.generated.vue';
import turnPhase from '../../components/turn-phase/turn-phase.vue';
import victoryModal from '../../components/victory-modal/victory-modal.vue';
import notificationBar from '../../components/notification/notification.vue';

import playersList from './players-list.vue';
import reinforcePanel from './reinforce-panel.vue';

import withLeaveGameOnExit from '../mixins/withLeaveGameOnExit';

export default {
  name: 'GameSession',
  components: {
    page,
    gameMap,
    turnPhase,
    victoryModal,
    playersList,
    reinforcePanel,
    notificationBar
  },
  mixins: [withLeaveGameOnExit],
  data() {
    return {
      playerName: '',
      playerColor: '',
      isEditingPlayer: false,
      highlightsToRemove: [],
      gameSettings: {
        // this errors when adding a new value, leave for now?
        placementMode: ''
      },
      viewToggles: {
        showPanel: false
      }
    };
  },
  computed: {
    playerID() {
      return this.$store.state.game.playerID;
    },
    currentGame() {
      const { currentGame } = this.$store.state.game;
      return currentGame;
    },
    currentPlayerTurn() {
      return this.$store.state.game.currentPlayerTurn;
    },
    isYourTurn() {
      return this.$store.state.game.playersTurn;
    },
    numUnclaimedTerritories() {
      return this.currentGame.availableTerritories.length;
    }
  },
  created() {
    if (!(this.currentGame && this.currentGame.id)) {
      return;
    }

    this.$store.dispatch('GET_GAME_DETAILS', this.currentGame.id);

    this.$watch(
      () => this.gameSettings,
      (gameSettings) => {
        // eslint-disable-next-line
        console.log(gameSettings);
      },
      { deep: true }
    );
  },
  methods: {
    togglePanel() {
      this.viewToggles.showPanel = !this.viewToggles.showPanel;
    },
    removeHighlight(highlightsToRemove) {
      this.highlightsToRemove = highlightsToRemove;
    },
    resetHighlightsFinished() {
      this.highlightsToRemove = [];
    }
  }
};
</script>

<style lang="scss" scoped>
@import './game-session.scss';
</style>
