const User = require("../models/User");
const Question = require("../models/Question")

exports.getAdminDashboard = async (req, res) => {
  try{
      let users = await User.find();
      let approvedQuestions = await Question.find({status: "approved"})
      let pendingQuestions = await Question.find({status: "pending"});
      return res.render("admin/admin_dashboard", {users, pendingQuestions, approvedQuestions});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getUsers = async(req, res) => {
  try {
    let users = await User.find();
    return res.render("admin/users/index", {users});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getQuestions = async(req, res) => {
  try {
    let questions = await Question.find();
    return res.render("admin/questions/index", {questions});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getUser = async(req, res) => {
  try {
    let userId = req.params.id;
    let user = await User.findById(userId);
    return res.render("admin/users/user", {user});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.getQuestion = async(req, res) => {
  try {
    let questionId = req.params.id;
    question = await Question.findById(questionId);
    return res.render("admin/questions/question", {question});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.putUsers = async (req, res) => {
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
    return res.send("Error: " + error.message);
  }
}

exports.putQuestions = async (req, res) => {
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
    return res.send("Error: " + error.message);
  }
}

exports.putUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    return res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.putQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(id, updates, { new: true });

    return res.json({ message: "Question updated successfully", user: updatedQuestion });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await Question.findByIdAndDelete(id);
    return res.json({message: "Question deleted successfuly"});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    return res.json({message: "User deleted successfuly"});
  } catch (error) {
    return res.send("Error: " + error.message);
  }
}