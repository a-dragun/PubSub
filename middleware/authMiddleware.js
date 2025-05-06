const User = require("../models/User");

function requireAuth(req, res, next) {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    next();
}

function checkAdminLevel(requiredLevel) {
  return async (req, res, next) => {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    
    if (user.adminLevel < requiredLevel) {
      return res.redirect("/");
    } else {
      next();
    }
  };
}

function blockAuthenticatedUser(req, res, next) {
    if(req.session.user) {
        return res.redirect("/");
    }
    next();
}

async function checkBan(req, res, next) {
  const user = await User.findById(req.session.user.id);

  if (!user || user.isBanned) {
    return res.status(403).send(`Access denied. You are banned until ${user.banDuration}.\nBan reason: ${user.banReason}`);
  }

  next();
};


module.exports = { requireAuth, blockAuthenticatedUser, checkAdminLevel, checkBan};

