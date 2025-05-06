module.exports = function(io) {
  const roomUsers = {};

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('joinRoom', ({ roomId, username }) => {
      socket.join(roomId);

      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      if (!roomUsers[roomId].includes(username)) {
        roomUsers[roomId].push(username);
      }

      io.to(roomId).emit('userListUpdated', roomUsers[roomId]);

      console.log(`${username} joined room ${roomId}`);
    });

    socket.on('chatMessage', ({ roomId, message, username }) => {
      io.to(roomId).emit('chatMessage', { username, message });
    });

    socket.on('disconnect', () => {
      for (let roomId in roomUsers) {
        roomUsers[roomId] = roomUsers[roomId].filter(user => user !== socket.username);
        io.to(roomId).emit('userListUpdated', roomUsers[roomId]);
      }

      console.log('User disconnected', socket.id);
    });
  });
};
