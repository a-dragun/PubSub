const User = require("../models/User");
const Question = require("../models/Question")

exports.getAdminDashboard = async (req, res) => {
    let users = await User.find();
    let approvedQuestions = await Question.find({status: "approved"})
    let pendingQuestions = await Question.find({status: "pending"});
    return res.render("admin/admin_dashboard", {users, pendingQuestions, approvedQuestions});
}

exports.getUsers = async(req, res) => {
  let users = await User.find();
  return res.render("admin/users/index", {users});
}

exports.getQuestions = async(req, res) => {
  let questions = await Question.find();
  return res.render("admin/questions/index", {questions});
}

exports.getUser = async(req, res) => {
  let userId = req.params.id;
  user = await User.findById(userId);
  return res.render("admin/users/user", {user});
}

exports.getQuestion = async(req, res) => {
  let questionId = req.params.id;
  question = await Question.findById(questionId);
  return res.render("admin/questions/question", {question});
}

exports.patchUsers = async (req, res) => {
  try {
    const updates = req.body.users;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Invalid users payload" });
    }

    const updatePromises = updates.map(userUpdate => {
      const { id, ...changes } = userUpdate;
      if (!id) return Promise.resolve();
      return User.findByIdAndUpdate(id, changes, { new: true });
    });

    await Promise.all(updatePromises);

    return res.json({ message: "Users updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.patchQuestions = async (req, res) => {
  try {
    const updates = req.body.questions;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Invalid questions payload" });
    }

    const updatePromises = updates.map(questionUpdate => {
      const { id, ...changes } = questionUpdate;
      if (!id) return Promise.resolve();
      return Question.findByIdAndUpdate(id, changes, { new: true });
    });

    await Promise.all(updatePromises);

    return res.json({ message: "Questions updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.patchUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    return res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.patchQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(id, updates, { new: true });

    return res.json({ message: "Question updated successfully", user: updatedQuestion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await Question.findByIdAndDelete(id);
    return res.json({message: "Question deleted successfuly"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    return res.json({message: "User deleted successfuly"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}