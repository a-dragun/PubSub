const User = require("../models/User")

function requireAuth(req, res, next) {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    next();
}

function checkAdminLevel(requiredLevel) {
  return (req, res, next) => {
    const userAdminLevel = req.user && req.user.adminLevel;
    
    if (userAdminLevel < requiredLevel) {
      res.status(403).send('Forbidden: Insufficient privileges');
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

module.exports = { requireAuth, blockAuthenticatedUser, checkAdminLevel};

