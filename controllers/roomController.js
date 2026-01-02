const Room = require("../models/Room");
const User = require("../models/User");
const { getAllRoomCounts } = require('../state/roomState');

exports.getRoomsPage = async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    const leaderboardUsers = await User.find({}, 'name totalScore lastLoginAt')
      .sort({ totalScore: -1 })
      .limit(10);

    const roomCounts = getAllRoomCounts();

    const roomsWithCounts = rooms.map(room => ({
      ...room,
      onlineCount: roomCounts[room._id.toString()] || 0
    }));

    return res.render("rooms/index", {
      rooms: roomsWithCounts,
      leaderboardUsers
    });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};


exports.getRoomPage = async (req, res) => {
    try {
      const roomId = req.params.id;
      const room = await Room.findById(roomId);
      if(!room) {
        res.send("Soba ne postoji!");
      }
      else {
        let userId = req.session.user.id;
        let dbUser = await User.findById(userId).lean();
        const { password, ...user } = dbUser;
        if(room.name === user.name) {
          res.send("Ne možete pristupiti ovoj sobi!");
        }
        return res.render("rooms/room", {room, user});
      }
    } catch (error) {
      return res.send("Error: " + error.message);
    }
};