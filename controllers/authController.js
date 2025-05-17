const User = require("../models/User");
const bcrypt = require("bcryptjs");


exports.getRegister = (req, res) => {
  try {
    return res.render("auth/register");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, profile_picture } = req.body;
    const user = await User.create({ name, email, password, profilePicture: profile_picture });
    req.session.user = { id: user._id, name: user.name, profile_picture };
    return res.redirect("/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.getLogin = (req, res) => {
  try {
    return res.render("auth/login");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({'name': username});

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.send("Invalid username or password");
    }

    req.session.user = { id: user._id, name: user.name, profilePicture: user.profilePicture, adminLevel: user.adminLevel };
    return res.redirect("/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.send("Logout failed: " + err.message);
      }
      res.clearCookie('connect.sid');
      return res.redirect('/');
    });
};

