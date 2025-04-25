const User = require("../models/User");
const Question = require("../models/Question")
const {isAuthenticated, checkAdminLevel} = require("../middleware/authMiddleware")

exports.getAdminDashboard = async (req, res) => {
    let users = await User.find();
    let approvedQuestions = await Question.find({status: "approved"})
    let pendingQuestions = await Question.find({status: "pending"});
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
        res.render("admin/admin_dashboard", {user, users, pendingQuestions, approvedQuestions});
    }
    else {
        res.redirect("/");
    }
}

exports.postDeleteUser = (req, res) => {
  if(checkAdminLevel(req, 2)) { 
    const {id} = req.body;
    deleteUser(id)
      .then(() => res.status(200)
      .send('User deleted.'))
      .catch((err) => res.status(500).send("Failed to delete user"));
  }
  else {
    res.status(500).send("Failed to delete user");
  }
}

exports.postChangeAdminLevel = (req, res) => {
  if(checkAdminLevel(req, 2)) {
    const {id, adminLevel} = req.body;
    updateAdminLevel(id, adminLevel)
      .then(() => res.status(200)
      .send('Admin level updated.'))
      .catch((err) => res.status(500).send("Failed to update admin level."));
  }
  else {
    res.status(500).send("Failed to delete user");
  }
}

exports.postHandleQuestion = (req, res) => {
  const {id, status} = req.body;
  handleQuestion(id, status)
    .then(() => res.status(200)
    .send('Question status updated.'))
    .catch((err) => res.status(500).send("Failed to change question status."));
}

async function deleteUser(id) {
  try {
    await User.findById(id).deleteOne();
    console.log(`Deleting user ${id}`);
    return Promise.resolve();
  } catch (e) {
      print(e);
  }
}

async function updateAdminLevel(id, adminLevel) {
  try {
    await User.findById(id).updateOne({"adminLevel" : adminLevel});
    console.log(`Updating user ${id} to admin level ${adminLevel}`);
    return Promise.resolve();
  } catch (e) {
      print(e);
}
}

async function handleQuestion(id, status) {
  try{
    await Question.findById(id).updateOne({"status": status});
    console.log(`Updating question ${id} to status ${status}`);
    return Promise.resolve();
  } catch (e) {
      print(e);
  }
}