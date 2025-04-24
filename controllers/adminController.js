const User = require("../models/User");
const Question = require("../models/Question")
const {isAuthenticated} = require("../middleware/authMiddleware")

exports.getAdminDashboard = async (req, res) => {
    let users = await User.find();
    let questions = await Question.find();
    let user = null;
    if (isAuthenticated(req)) {
        const dbUser = await User.findById(req.session.user.id);
        if (dbUser) {
          user = {
            id: dbUser._id,
            name: dbUser.name,
            adminLevel: dbUser.adminLevel
          };
        }
      }
    if(user && user.adminLevel > 0) {
        res.render("admin/admin_dashboard", {users, questions});
    }
    else {
        res.redirect("/");
    }
}