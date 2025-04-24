const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { isAuthenticated, blockAuthenticatedPost } = require("../middleware/authMiddleware");

exports.getHome = async (req, res) => {
  let user = null;
  if (req.session && req.session.user) {
    const dbUser = await User.findById(req.session.user.id);
    if (dbUser) {
      user = {
        id: dbUser._id,
        name: dbUser.name,
        adminLevel: dbUser.adminLevel
      };
      
    }
  }

  res.render("home", { user });
};


exports.getRegister = (req, res) => {
  if(!isAuthenticated(req))
    res.render("register");
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
    res.render("login");
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

exports.getLogout = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};
