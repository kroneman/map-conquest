const { expect } = require('chai');
const ChatStateMixin = require('./chatStateMixin');

const ChatState = ChatStateMixin(class Base {});
const chatState = new ChatState();

describe('Server Chat State Mixin', () => {
  describe('When initialized', () => {
    it('has no items in the chat', () => {
      expect(chatState).to.deep.include({ chat: [] });
    });

    it('can add a message to the list', () => {
      chatState.addChatMessage({ name: 'Some Name' }, 'What a lovely day');
      expect(chatState.chat).to.deep.equal([
        {
          player: { name: 'Some Name' },
          message: 'What a lovely day'
        }
      ]);
    });
  });
});
