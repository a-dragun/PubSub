const Room = require("./models/Room");
const Question = require("./models/Question");
const User = require("./models/User");
const {levels, getLevelByScore} = require('./config/levels');
const scoreService = require("./helpers/scoreService");
const userSocketMap = new Map();
const {hasProfanity} = require("./helpers/profanity");
const {
  addUserToRoom,
  removeUserFromRoom,
  roomUsers
} = require('./state/roomState');


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

      io.to(roomId).emit('chatMessage', {
            username: room.name,
            message: `Korisnik ${user.name} se pridružio sobi!`
      });

      userSocketMap.set(username, { socket, isMuted: user.isMuted });

      socket.join(roomId);
      socket.username = username;
      socket.roomId = roomId;

      addUserToRoom(roomId, username);


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
      const user = await User.findOne({ name: username });
      const oldLevelNumber = user.currentLevel;

      if (currentQuestion && currentQuestion.answers && !currentQuestion.answered) {
        const correctAnswers = currentQuestion.answers.map(ans => normalizeAnswer(ans));

        if (correctAnswers.includes(normalizedMessage)) {
          currentQuestion.answered = true;

          const room = await Room.findById(roomId);
          user.totalScore += room.points;
          await user.save();
          scoreService.addPoints(user.id, room.points);

          const newLevelNumber = user.currentLevel;

          if (newLevelNumber > oldLevelNumber) {
            const levelData = getLevelByScore(user.totalScore);

            if(userSocketMap){
              const userSocket = userSocketMap.get(user.name);
              if (userSocket && userSocket.socket) {
                userSocket.socket.emit("levelUp", {
                level: levelData.level,
                name: levelData.name,
                description: levelData.description,
                icon: levelData.icon,
                max_score: levelData.max_score,
                user_score: user.totalScore,
              });
              }
            }
          }

          io.to(roomId).emit('chatMessage', {
            username: currentQuestion.room.name,
            message: `Točan odgovor je: <strong>${currentQuestion.answers[0]}</strong>!\n<strong>${username}</strong> je točno odgovorio ["${message}"] i zaradio <strong>${room.points} bodova</strong>!`,
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

      if (hasProfanity(normalizedMessage)) {
        if (userSocket && userSocket.socket) {
          userSocket.socket.emit('profanityWarning', {
            message: 'Molimo vas da se suzdržite od neprimjerenog jezika.'
          });
        }
        return;
      }


      if (!isMuted) {
        io.to(roomId).emit('chatMessage', { username, message });
        userSocket.isMuted = true;
        setTimeout(function(){
          userSocket.isMuted = false;
        }, 750)
      }
    });

    socket.on('disconnect', async () => {
      for (const [username, s] of userSocketMap.entries()) {
        if (s.socket === socket) {
          userSocketMap.delete(username);
          const room = await Room.findById(socket.roomId);
          io.to(socket.roomId).emit('chatMessage', {
            username: room.name,
            message: `Korisnik ${username} je napustio sobu!`
          });
          break;
        }
      }

      if (socket.roomId && socket.username) {
        removeUserFromRoom(socket.roomId, socket.username);

        await emitUserList(socket.roomId, io, roomUsers);

        if (!roomUsers[socket.roomId]) {
          console.log(`Room ${socket.roomId} is now empty.`);
          clearRoomTimeouts(socket.roomId, roomTimers, roomTimeouts);
          delete activeQuestions[socket.roomId];
        }
      }
      console.log('User disconnected', socket.id);
    });
  });

async function emitUserList(roomId, io, roomUsers) {
  const users = await User.find(
    { name: { $in: roomUsers[roomId] } },
    'name totalScore profilePicture adminLevel id'
  );

  const formattedUsers = users.map(user => {
    const level = getLevelByScore(user.totalScore);

    return {
      id: user.id,
      name: user.name,
      totalScore: user.totalScore,
      profilePicture: user.profilePicture,
      adminLevel: user.adminLevel,

      level: level ? {
        number: level.level,
        name: level.name,
        icon: level.icon,
        minScore: level.min_score,
        maxScore: level.max_score+1
      } : null
    };
  });

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