const User = require("../models/User");

exports.deleteUser = async (req, res) => {
  try {
    const user = req.session.user;
    const id = req.session.user.id;
    if(user.id == id){
        await User.findByIdAndDelete(id);
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
    if(username) {
      user.name = username;
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