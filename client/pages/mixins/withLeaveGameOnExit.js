
export default {
  beforeRouteLeave(to, from, next) {
    const startingGame = to.name === 'gameSession';
    if (startingGame) {
      return next();
    }

    if (this.$store.state.game.currentGame.id) {
      this.$store.dispatch('LEAVE_GAME');
    }

    return next();
  }
};
