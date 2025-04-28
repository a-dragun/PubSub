const User = require("../models/User");
const Question = require("../models/Question")

exports.getCreateQuestion = async (req, res) => {
    return res.render("questions/create_question");
};


exports.postCreateQuestion = async (req, res) => {
  const { text, answer1, answer2, answer3, answer4} = req.body;
  try {
    await Question.create({ text: text, answers: [answer1, answer2, answer3, answer4], authorId: req.session.user.id, status: 'pending' });
  } catch (error) {
    return res.send("Error: " + error.message);
  }
  return res.redirect("/questions/new");
};