export const socketConfig = {
  events: {
    message: {
      new: 'message.new',
      send: 'message.send',
      update: 'message.update',
      remove: 'message.remove',
    },
    room: {
      join: 'room.join',
      update: 'room.update',
      leave: 'room.leave',
      delete: 'room.delete',
      participant: {
        update: 'room.participant.update',
      },
    },
    chat: {
      join: 'chat.join',
      leave: 'chat.leave',
    },
  },
};
