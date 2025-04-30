const User = require("../models/User");
const bcrypt = require("bcryptjs");


exports.getRegister = (req, res) => { //user koji je logiran ne smije vidjet register page cak ni kada se vraca unatrag
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

exports.getLogin = (req, res) => { //user koji je logiran ne smije vidjeti login page cak ni kada se vraca unatrag
  try {
    return res.render("auth/login");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({email});

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.send("Invalid email or password");
    }

    req.session.user = { id: user._id, name: user.name, profilePicture: user.profilePicture };
    return res.redirect("/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.logout = (req, res) => {
  try {
    return req.session.destroy(() => res.redirect("/"));
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};
