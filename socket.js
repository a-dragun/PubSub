const Room = require("./models/Room");
const Question = require("./models/Question");
const User = require("./models/User");

module.exports = function(io) {
  const roomUsers = {};
  const roomTimers = {};
  const roomTimeouts = {};
  const activeQuestions = {};

  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('joinRoom', async ({ roomId, username }) => {
      const room = await Room.findById(roomId);
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
      const normalizedMessage = message.trim().toLowerCase();


      if (currentQuestion && currentQuestion.answers) {
        const correctAnswers = currentQuestion.answers.map(ans => ans.toLowerCase());

        if (correctAnswers.includes(normalizedMessage)) {
          const room = await Room.findById(roomId);
          await User.findOneAndUpdate({ name: username }, { $inc: { totalScore: room.points } });

          io.to(roomId).emit('chatMessage', {
            username: currentQuestion.room.name,
            message: `${username} je točno odgovorio. Točan odgovor je: ${currentQuestion.answers[0]}!`
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

      io.to(roomId).emit('chatMessage', { username, message });
    });

    socket.on('disconnect', async () => {
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
};

async function emitUserList(roomId, io, roomUsers) {
  const users = await User.find({ name: { $in: roomUsers[roomId] } }, 'name totalScore');
  const formattedUsers = users.map(user => ({
    name: user.name,
    totalScore: user.totalScore
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
  if(!question) {return;}
  activeQuestions[roomId] = {
    ...question,
    room
  };

  io.to(roomId).emit('chatMessage', {
    username: room.name,
    message: question.text,
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
    io.to(roomId).emit('chatMessage', {
      username: room.name,
      message: `Answer: ${question.answers[0]}`
    });

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
