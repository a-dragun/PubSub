const Room = require("../models/Room");

exports.getRoomsPage = async (req, res) => {
  try {
    rooms = await Room.find().lean();
    return res.render("rooms/index", {rooms});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.getRoomPage = async (req, res) => {
    try {
      roomId = req.params.id;
      room = await Room.findById(roomId);
      return res.render("rooms/room", {room});
    } catch (error) {
      return res.send("Error: " + error.message);
    }
  };