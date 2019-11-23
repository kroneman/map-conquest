
module.exports = GameInstanceState => class extends GameInstanceState {
  constructor(props) {
    super(props);
    this.chat = [];
  }

  addChatMessage(player, message) {
    this.chat = [
      ...this.chat,
      {
        player,
        message
      }
    ];
  }
};
