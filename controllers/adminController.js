const User = require("../models/User");
const Question = require("../models/Question")

exports.getAdminDashboard = async (req, res) => {
  try{
      let dbUsers = await User.find().lean();
      let users = dbUsers.map(({ password, ...user }) => user);
      let questions = await Question.find().lean();
      let pendingQuestions = [...(questions.filter(q => q.status == 'pending'))];
      let mutedUsers = [...(users.filter(u => u.isMuted == true))];
      let bannedUsers = [...(users.filter(u => u.isBanned == true))];
      return res.render("admin/admin_dashboard", {mutedUsers, bannedUsers, pendingQuestions});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getUsers = async(req, res) => {
  try {
    let dbUsers = await User.find().lean();
    let users = dbUsers.map(({ password, ...user }) => user);
    return res.render("admin/users/index", {users});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getQuestions = async(req, res) => {
  try {
    let questions = await Question.find().lean();
    let approvedQuestions = [...(questions.filter(q => q.status == 'approved'))];
    let pendingQuestions = [...(questions.filter(q => q.status == 'pending'))];
    return res.render("admin/questions/index", {approvedQuestions, pendingQuestions});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getUser = async(req, res) => {
  try {
    let userId = req.params.id;
    let dbUser = await User.findById(userId).lean();
    const { password, ...filteredUser } = dbUser;
    return res.render("admin/users/user", {filteredUser});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getQuestion = async(req, res) => {
  try {
    let questionId = req.params.id;
    let question = await Question.findById(questionId);
    let user = await User.findById(question.authorId);
    if(user) {
      username = user.name
    } else {
      username = "deleted user"
    }
    return res.render("admin/questions/question", {question, username});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const currentUser = req.session.user;

    if(id != currentUser.id)
      await User.findByIdAndUpdate(id, updates, { new: true });

    return res.redirect(`/admin/users/${id}`);
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.updateQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await Question.findByIdAndUpdate(id, {"status" : "approved"});

    return res.redirect("/admin/questions");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await Question.findByIdAndDelete(id);
    return res.redirect("/admin/questions/");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    let user = await User.findById(id);
    if (user.adminLevel == 2) {
      return res.redirect(`/admin/users/${id}`);
    }
    else {
      await user.deleteOne();
      return res.redirect("/admin/users/");
    }
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.bulkUpdate = async (req, res) => {
  try {
    const { actions } = req.body;

    for (const action of actions.users) {
      const { id, actionType } = action;
      const user = await User.findById(id);

      if (actionType === 'unmute' && user) {
        user.isMuted = false;
        await user.save();
      } else if (actionType === 'unban' && user) {
        user.isBanned = false;
        await user.save();
      }
    }
    
    for (const action of actions.questions) {
      const { id, actionType } = action;
      const question = await Question.findById(id);

      if (actionType === 'approve' && question) {
        question.status = 'approved';
        await question.save();
      } else if (actionType === 'delete' && question) {
        await question.deleteOne();
      }
    }

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
