const roomUsers = {};

function addUserToRoom(roomId, username) {
  if (!roomUsers[roomId]) roomUsers[roomId] = [];
  if (!roomUsers[roomId].includes(username)) {
    roomUsers[roomId].push(username);
  }
}

function removeUserFromRoom(roomId, username) {
  if (!roomUsers[roomId]) return;
  roomUsers[roomId] = roomUsers[roomId].filter(u => u !== username);
  if (roomUsers[roomId].length === 0) {
    delete roomUsers[roomId];
  }
}

function getRoomUserCount(roomId) {
  return roomUsers[roomId]?.length || 0;
}

function getAllRoomCounts() {
  const result = {};
  for (const roomId in roomUsers) {
    result[roomId] = roomUsers[roomId].length;
  }
  return result;
}

module.exports = {
  roomUsers,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUserCount,
  getAllRoomCounts
};
