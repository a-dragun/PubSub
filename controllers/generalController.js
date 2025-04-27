const User = require("../models/User");

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