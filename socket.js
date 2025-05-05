module.exports = function(io) {
    io.on('connection', (socket) => {
    console.log('User connected');
  
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });
  
    socket.on('chatMessage', ({ roomId, message }) => {
      io.to(roomId).emit('chatMessage', message);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}