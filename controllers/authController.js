const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isAuthenticated, blockAuthenticatedPost } = require("../middleware/authMiddleware");


exports.getRegister = (req, res) => {
  if(!isAuthenticated(req))
    res.render("auth/register");
  else
    res.redirect("/");
};

exports.postRegister = async (req, res) => {
  if(!isAuthenticated(req)) {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    req.session.user = { id: user._id, name: user.name };
    res.redirect("/");
  } catch (error) {
    res.send("Error: " + error.message);
  }
 }
 else {
  res.redirect("/");
 }
};


exports.getLogin = (req, res) => {
  if(!isAuthenticated(req))
    res.render("auth/login");
  else
    res.redirect("/");
};

exports.postLogin = [blockAuthenticatedPost, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({email});

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.send("Invalid email or password");
  }

  req.session.user = { id: user.id, name: user.name };
  res.redirect("/");
}];

exports.postLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};
