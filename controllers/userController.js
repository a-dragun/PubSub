const User = require("../models/User");
const socketHandler	= require("../socket");
const userSocketMap = socketHandler.userSocketMap;

exports.deleteUser = async (req, res) => {
  try {
    const user = req.session.user;
    if(user && user.id){
      const userSocket = userSocketMap.get(user.name);
      if (userSocket && userSocket.socket) {
        userSocket.socket.emit('forceDisconnect', { reason: "Obrisan račun" });
        userSocket.socket.disconnect();
      }
        await User.findByIdAndDelete(user.id);
        req.session.destroy(() => res.redirect("/"));
    }
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getProfile = async (req, res) => {
    try {
      let userId = req.session.user.id;
      let dbUser = await User.findById(userId).lean();
      const { password, ...user } = dbUser;
      return res.render("user/profile", {user});

    } catch (error) {
        return res.send("Error: " + error.message);
    }
}

exports.editUser = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { username, newPassword, repeatPassword, profilePicture } = req.body;

    if (newPassword || repeatPassword) {
      if (newPassword !== repeatPassword) {
        return res.send("Passwords do not match.");
      }
    }
    
    const user = await User.findById(userId);
    const userSocket = userSocketMap.get(user.name);
      if (userSocket && userSocket.socket) {
        userSocket.socket.emit('forceDisconnect', { reason: "Uređen račun" });
        userSocket.socket.disconnect();
      }
    if(username && username.length <= 15) {
      user.name = username;
    }
    else {
      res.send("Invalid username");
    }
    
    if(profilePicture) {
      user.profilePicture = profilePicture;
    }

    if (newPassword) {
      user.password = newPassword;
    }
    await user.save();

    return res.redirect("/user/profile/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};


exports.getEditUserPage = async (req, res) => {
  try {
    let userId = req.session.user.id;
    let user = await User.findById(userId).lean();
    return res.render("user/editUser", {user});

  } catch (error) {
      return res.send("Error: " + error.message);
  }
}