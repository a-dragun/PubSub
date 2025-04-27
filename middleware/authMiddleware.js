const User = require("../models/User")

function isAuthenticated(req) {
    if (req.session.user != null) {
        return true;
    }
    return false;
}

function blockAuthenticatedPost(req, res, next) {
    if(req.session.user) {
        return res.status(403).send("You are already logged in");
    }
    next();
}

async function checkAdminLevel(req, adminLevel) {
    userAdminLevel = null;
    if(req.session.user) {
        const dbUser = await User.findById(req.session.user.id);
        if (dbUser) {
            userAdminLevel = dbUser.adminLevel;
        }
        if(userAdminLevel && userAdminLevel >= adminLevel) {
            return true;
        }
        else {
            return false;
        }
    }
}

module.exports = { isAuthenticated, blockAuthenticatedPost, checkAdminLevel};

