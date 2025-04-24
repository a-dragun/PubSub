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

module.exports = { isAuthenticated, blockAuthenticatedPost};

