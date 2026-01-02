const Room = require("../models/Room");
const User = require("../models/User");
const { getAllRoomCounts } = require('../state/roomState');
const bcrypt = require('bcryptjs');
const {checkAdminLevel} = require('../middleware/authMiddleware');

exports.getRoomsPage = async (req, res) => {
    try {
        const rooms = await Room.find().lean();
        const leaderboardUsers = await User.find({}, 'name totalScore lastLoginAt')
            .sort({ totalScore: -1 })
            .limit(10);

        const roomCounts = getAllRoomCounts();
        let roomsWithCounts = rooms.map(room => ({
            ...room,
            onlineCount: roomCounts[room._id.toString()] || 0
        }));
        roomsWithCounts.sort((a, b) => {
            return b.onlineCount - a.onlineCount;
        });
        return res.render("rooms/index", {
            rooms: roomsWithCounts,
            leaderboardUsers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error: " + error.message);
    }
};


exports.getPasswordForm = async (req, res) => {
    const roomId = req.params.id;
    return res.render("rooms/password_form", { roomId, error: null });
};

exports.getRoomPage = async (req, res) => {
    try {
        const roomId = req.params.id;
        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).send("Soba ne postoji!");
        }
        if (room.password && !req.session.user.adminLevel > 0) {
            const isAuthorized = req.session.authorizedRooms && req.session.authorizedRooms.includes(roomId);
            
            if (!isAuthorized) {
                return res.redirect(`/rooms/${roomId}/password`);
            }
        }

        let userId = req.session.user.id;
        let dbUser = await User.findById(userId).lean();
        const { password, ...user } = dbUser;

        if (room.name === user.name) {
             return res.status(403).send("Ne možete pristupiti ovoj sobi!");
        }

        return res.render("rooms/room", { room, user });

    } catch (error) {
      console.error("Greška:", error);
    }
};

exports.verifyPasswordAndAuthorize = async (req, res) => {
    const roomId = req.params.id;
    const user = req.session.user;
    const { password } = req.body;
    
    try {
        const room = await Room.findById(roomId);
        
        if (!room || !room.password) {
            return res.redirect(`/rooms/${roomId}`);
        }

        const isMatch = await bcrypt.compare(password, room.password);

        if (isMatch) {
            req.session.authorizedRooms = req.session.authorizedRooms || [];
            if (!req.session.authorizedRooms.includes(roomId)) {
                 req.session.authorizedRooms.push(roomId);
            }
            return res.redirect(`/rooms/${roomId}`);
            
        } else {
            return res.render("rooms/password_form", { 
                roomId, 
                error: "Netočna lozinka. Pokušajte ponovno." 
            });
        }
    } catch (error) {
        console.error("Greška kod provjere lozinke:", error);
        return res.status(500).send("Greška na poslužitelju.");
    }
};