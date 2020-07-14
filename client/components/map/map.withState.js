import find from 'lodash/find';

export default {
  computed: {
    isYourTurn() {
      return this.$store.state.game.playersTurn;
    },
    isTurnDraft() {
      return this.$store.getters.isTurnDraft;
    },
    isTurnAttack() {
      return this.$store.getters.isTurnAttack;
    },
    isTurnReinforce() {
      return this.$store.getters.isTurnReinforce;
    },
    reinforceConfig() {
      return this.$store.state.game.reinforceConfig;
    },
    attackConfig() {
      return this.$store.state.game.attackConfig;
    },
    currentGame() {
      return this.$store.state.game.currentGame;
    },
    player() {
      const { playerID } = this.$store.state.game;
      const { players } = this.currentGame;
      return find(players, player => player.id === playerID);
    },
    playerHasReinforcements() {
      return Boolean(this.player) && this.player.reinforcements < 1;
    }
  },
  created() {
    this.$watch(
      () => this.$store.state.game.currentGame.territories,
      this.onTerritoryStateUpdated,
      { deep: true }
    );
  },
  mounted() {
    if (this.testMap) {
      return;
    }

    this.bindStateEvents();
  },
  beforeDestroy() {
    if (this.testMap) {
      return;
    }

    this.unbindStateEvents();
  },
  methods: {
    bindStateEvents() {
      this.pathEls.map((pathElement) => {
        pathElement.addEventListener(
          'click',
          this.territoryClicked.bind(this)
        );

        return pathElement;
      });
    },
    unbindStateEvents() {
      this.pathEls.map((pathElement) => {
        pathElement.removeEventListener('click', this.territoryClicked);
        return pathElement;
      });
    },
    async territoryClicked(event) {
      if (!this.isYourTurn) {
        return;
      }

      const el = event.target;
      const id = el.getAttribute('id');
      if (this.isTurnAttack) {
        await this.territoryClickedAttack(id);
        return;
      }

      if (this.isTurnReinforce) {
        await this.territoryClickedReinforce(id);
        return;
      }

      this.$store.dispatch('TERRITORY_CLICKED', id);
    },
    async territoryClickedAttack(id) {
      const isReadyToAttack = this.selectAttackTerritory(id);
      if (!isReadyToAttack) {
        return;
      }

      const { attackFrom, attackTo } = this.attackConfig;
      await this.$store.dispatch('ATTACK_TERRITORY', {
        attackerID: attackFrom,
        defenderID: attackTo
      });

      this.resetHighlight(attackFrom);
      this.resetHighlight(attackTo);
    },
    selectAttackTerritory(id) {
      const { attackFrom, attackTo } = this.attackConfig;
      if (attackTo && attackFrom) {
        this.$store.commit('attackConfig', {
          attackFrom: null,
          attackTo: null
        });
        return false;
      }

      if (!attackFrom) {
        this.highlightTerritory(id);
        this.$store.commit('attackConfig', {
          attackFrom: id
        });
        return false;
      }

      this.highlightTerritory(id);
      this.$store.commit('attackConfig', {
        attackTo: id
      });
      return true;
    },
    async territoryClickedReinforce(id) {
      const isReadyToReinforce = this.selectReinforceTerritory(id);
      if (!isReadyToReinforce) {
        return;
      }

      await this.$store.dispatch('REINFORCE_TERRITORY_UI', true);
    },
    selectReinforceTerritory(id) {
      const { reinforceFrom, reinforceTo } = this.reinforceConfig;
      if (reinforceFrom && reinforceTo) {
        this.resetHighlight(reinforceFrom);
        this.resetHighlight(reinforceTo);
        this.$store.dispatch('REINFORCE_RESET');
        return false;
      }

      if (!reinforceFrom) {
        const attackerTerritory = this.$store.getters.territoryByID[id];
        const minArmyTransfer = 0;
        const maxArmyTransfer = attackerTerritory.armies - 1;
        this.highlightTerritory(id);
        this.$store.commit('reinforceConfig', {
          reinforceFrom: id,
          min: minArmyTransfer,
          max: maxArmyTransfer
        });
        return false;
      }

      this.highlightTerritory(id);
      this.$store.commit('reinforceConfig', {
        reinforceTo: id
      });
      return true;
    }
  }
};
