const User = require("../models/User");
const socketHandler	= require("../socket");
const userSocketMap = socketHandler.userSocketMap;

exports.deleteUser = async (req, res) => {
  try {
    const user = req.session.user;
    if(user && user.id){
      if(userSocketMap){
        const userSocket = userSocketMap.get(user.name);
        if (userSocket && userSocket.socket) {
          userSocket.socket.emit('forceDisconnect', { reason: "Obrisan račun" });
        }
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
      if (!newPassword || newPassword.length < 8) {
        return res.send("Password must have at least 8 characters.");
      }
    }

    if (username && (username.length > 15 || username.includes(' '))) {
        return res.send("Username cannot contain more than 15 characters and has to be one word.");
      }
    
    
    const user = await User.findById(userId);

    if(userSocketMap){
        const userSocket = userSocketMap.get(user.name);
        if (userSocket && userSocket.socket) {
          userSocket.socket.emit('forceDisconnect', { reason: "Uređen račun" });
        }
      }
    if(username) {
      user.name = username;
    }
    
    if (profilePicture) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const isValid = allowedExtensions.some(ext => profilePicture.toLowerCase().endsWith(ext));
      if (!isValid) {
        return res.send("Profile picture must be an image (jpg, png, gif, webp).");
      }
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