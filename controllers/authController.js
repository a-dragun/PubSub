const User = require("../models/User");
const bcrypt = require("bcryptjs");


exports.getRegister = (req, res) => {
    return res.render("auth/register");
};

exports.postRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    req.session.user = { id: user._id, name: user.name };
    return res.redirect("/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};

exports.getLogin = (req, res) => {
    return res.render("auth/login");
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({email});

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send("Invalid email or password");
  }

  req.session.user = { id: user._id, name: user.name };
  return res.redirect("/");
};

exports.postLogout = (req, res) => {
  return req.session.destroy(() => res.redirect("/"));
};
