const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isYesterday } = require("date-fns");
const {isToday} = require("date-fns");

exports.getRegister = (req, res) => {
  try {
    return res.render("auth/register");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.postRegister = async (req, res) => {
  try {
      const { name, email, password, password_repeat } = req.body;
      if (!name || !email || !password || !password_repeat) {
        return res.send("All fields required.");
      }
      if (name.length > 15 || name.includes(' ')) {
        return res.send("Username cannot contain more than 15 characters and has to be one word.");
      }
      if (password.length < 8) {
        return res.send("Password must contain at least 8 characters.");
      }
      if (password !== password_repeat) {
        return res.send("Passwords do not match.");
      }
      const user = await User.create({ name: name, email: email, password: password, lastLoginAt: Date.now(), activityStreak: 1 });
      await user.save();
      req.session.user = { id: user._id, name: user.name, profile_picture: user.profilePicture };
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
    const loggedInYesterday = isYesterday(user.lastLoginAt);
    const loggedInToday = isToday(user.lastLoginAt);
    if(loggedInYesterday) {
      user.activityStreak+=1;
    }
    else if (!loggedInToday && !loggedInYesterday){
      user.activityStreak = 1;
    }
    user.lastLoginAt = Date.now();
    await user.save();
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

