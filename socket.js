const Room = require("./models/Room");
const Question = require("./models/Question");
const User = require("./models/User");

const userSocketMap = new Map();
const roomUsers = {};

function isRoomEmpty(roomId) {
  return !roomUsers[roomId] || roomUsers[roomId].length === 0;
}

function setupSocketHandlers(io) {
  const roomTimers = {};
  const roomTimeouts = {};
  const activeQuestions = {};

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('joinRoom', async ({ roomId, username }) => {
      const room = await Room.findById(roomId);
      const user = await User.findOne({ name: username });

      userSocketMap.set(username, { socket, isMuted: user.isMuted });

      socket.join(roomId);
      socket.username = username;
      socket.roomId = roomId;

      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }

      if (!roomUsers[roomId].includes(username)) {
        roomUsers[roomId].push(username);
      }

      await emitUserList(roomId, io, roomUsers);

      if (!roomTimers[roomId] && roomUsers[roomId].length > 0) {
        startGame(room, io, roomTimers, roomUsers, roomTimeouts, activeQuestions);
      }
    });

    socket.on('chatMessage', async ({ roomId, message, username }) => {
      const currentQuestion = activeQuestions[roomId];
      const normalizedMessage = normalizeAnswer(message.trim());
      const userSocket = userSocketMap.get(username);
      const isMuted = userSocket ? userSocket.isMuted : false;

      if (currentQuestion && currentQuestion.answers && !currentQuestion.answered) {
        const correctAnswers = currentQuestion.answers.map(ans => normalizeAnswer(ans));

        if (correctAnswers.includes(normalizedMessage)) {
          currentQuestion.answered = true;

          const room = await Room.findById(roomId);
          await User.findOneAndUpdate({ name: username }, { $inc: { totalScore: room.points } });

          io.to(roomId).emit('chatMessage', {
            username: currentQuestion.room.name,
            message: `${username} je točno odgovorio. Točan odgovor je: ${currentQuestion.answers[0]}!`,
            correct: true
          });

          await emitUserList(roomId, io, roomUsers);

          clearRoomTimeouts(roomId, roomTimers, roomTimeouts);
          delete activeQuestions[roomId];

          setTimeout(() => {
            startGame(currentQuestion.room, io, roomTimers, roomUsers, roomTimeouts, activeQuestions);
          }, currentQuestion.room.timeBetweenQuestions * 1000);

          return;
        }
      }

      if (!isMuted) {
        io.to(roomId).emit('chatMessage', { username, message });
      }
    });

    socket.on('disconnect', async () => {
      for (const [username, s] of userSocketMap.entries()) {
        if (s.socket === socket) {
          userSocketMap.delete(username);
          break;
        }
      }

      for (let roomId in roomUsers) {
        roomUsers[roomId] = roomUsers[roomId].filter(user => user !== socket.username);

        await emitUserList(roomId, io, roomUsers);

        if (roomUsers[roomId].length === 0) {
          console.log(`Room ${roomId} is now empty.`);
          clearRoomTimeouts(roomId, roomTimers, roomTimeouts);
          delete activeQuestions[roomId];
        }
      }

      console.log('User disconnected', socket.id);
    });
  });

  async function emitUserList(roomId, io, roomUsers) {
    const users = await User.find({ name: { $in: roomUsers[roomId] } }, 'name totalScore profilePicture adminLevel');
    const formattedUsers = users.map(user => ({
      name: user.name,
      totalScore: user.totalScore,
      profilePicture: user.profilePicture,
      adminLevel: user.adminLevel,
    }));
    io.to(roomId).emit('userListUpdated', formattedUsers);
  }

  function clearRoomTimeouts(roomId, roomTimers, roomTimeouts) {
    if (roomTimers[roomId]) {
      clearTimeout(roomTimers[roomId]);
      delete roomTimers[roomId];
    }

    if (roomTimeouts[roomId]) {
      const { hintTimeout, answerTimeout, nextQuestionTimeout } = roomTimeouts[roomId];
      clearTimeout(hintTimeout);
      clearTimeout(answerTimeout);
      clearTimeout(nextQuestionTimeout);
      delete roomTimeouts[roomId];
    }
  }

  async function startGame(room, io, roomTimers, roomUsers, roomTimeouts, activeQuestions) {
    const roomId = room.id;

    if (roomUsers[roomId].length === 0) {
      clearRoomTimeouts(roomId, roomTimers, roomTimeouts);
      return;
    }

    if (roomTimers[roomId]) return;

    const [question] = await Question.aggregate([
      {
        $match: {
          category: { $in: room.categories },
          status: 'approved'
        }
      },
      { $sample: { size: 1 } }
    ]);

    if (!question) return;

    activeQuestions[roomId] = {
      ...question,
      room,
      answered: false
    };

    io.to(roomId).emit('chatMessage', {
      username: room.name,
      message: `${question.category.toUpperCase()} : ${question.text}`,
    });

    if (question.image) {
      io.to(roomId).emit('chatMessage', {
        username: room.name,
        message: `<img src="${question.image}" alt="question image" style="max-width: 100%; max-height: 300px;">`
      });
    }

    const hintTimeout = setTimeout(() => {
      if (question.hint) {
        io.to(roomId).emit('chatMessage', {
          username: room.name,
          message: `Hint: ${question.hint}`
        });
      }
    }, room.hintTime * 1000);

    const answerTimeout = setTimeout(() => {
      if (!activeQuestions[roomId]?.answered) {
        io.to(roomId).emit('chatMessage', {
          username: room.name,
          message: `Nitko nije točno odgovorio. Točan odgovor je: ${question.answers[0]}`
        });
      }

      delete activeQuestions[roomId];

      const nextQuestionTimeout = setTimeout(() => {
        clearRoomTimeouts(roomId, roomTimers, roomTimeouts);
        delete activeQuestions[roomId];
        startGame(room, io, roomTimers, roomUsers, roomTimeouts, activeQuestions);
      }, room.timeBetweenQuestions * 1000);

      roomTimeouts[roomId].nextQuestionTimeout = nextQuestionTimeout;
      roomTimers[roomId] = nextQuestionTimeout;
    }, room.timeToAnswer * 1000);

    roomTimeouts[roomId] = {
      hintTimeout,
      answerTimeout,
      nextQuestionTimeout: null
    };

    roomTimers[roomId] = answerTimeout;
  }

  function normalizeAnswer(answer) {
    return answer
      .toLowerCase()
      .replace(/š/g, 's')
      .replace(/đ/g, 'd')
      .replace(/[čć]/g, 'c')
      .replace(/ž/g, 'z');
  }
  //setupSocketHandlers.userSocketMap = userSocketMap;

  return io;
}

module.exports = {setupSocketHandlers, userSocketMap, isRoomEmpty};