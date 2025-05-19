const Room = require("../models/Room");
const User = require("../models/User");

exports.getRoomsPage = async (req, res) => {
  try {
    const rooms = await Room.find().lean();
    return res.render("rooms/index", {rooms});
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
        return res.render("rooms/room", {room, user});
      }
    } catch (error) {
      return res.send("Error: " + error.message);
    }
};