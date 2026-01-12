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
  if (req.session.user) {
    return res.redirect("/");
  }
  next();
}

async function checkBan(req, res, next) {
  const user = await User.findById(req.session.user.id);

  if (user && user.isBanned) {
    return res.status(403).send(`Access denied. You are banned until ${user.banDuration}.\nBan reason: ${user.banReason}`);
  }
  next();
};


function checkEditorOrAdmin(req, res, next) {
  if (req.session.user && (req.session.user.isEditor || req.session.user.adminLevel >= 1)) {
    next();
  } else {
    res.redirect('/');
  }
}

async function updateUserSession(req, res, next) {
  if (req.session && req.session.user) {
    try {
      const user = await User.findById(req.session.user.id).lean();
      if (user) {
        req.session.user.isEditor = user.isEditor;
        req.session.user.adminLevel = user.adminLevel;
        req.session.user.editorRequestStatus = user.editorRequestStatus;
        req.session.user.name = user.name;
        req.session.user.profilePicture = user.profilePicture;

        res.locals.currentUser = req.session.user;
      }
    } catch (err) {
      console.error("Session update error:", err);
    }
  }
  next();
}


module.exports = { requireAuth, blockAuthenticatedUser, checkAdminLevel, checkBan, checkEditorOrAdmin, updateUserSession };
