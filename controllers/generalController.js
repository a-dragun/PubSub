const User = require("../models/User");

exports.getHome = async (req, res) => {
  try {
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
  
    return res.render("home", { user });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
  };