const User = require("../models/User");
const Question = require("../models/Question")

exports.getCreateQuestionPage = async (req, res) => {
  try {
    return res.render("questions/create_question");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};


exports.createQuestion = async (req, res) => {
  try {
    const { text, answer1, answer2, answer3, answer4} = req.body;
    await Question.create({ text: text, answers: [answer1, answer2, answer3, answer4], authorId: req.session.user.id, status: 'pending' });
    return res.redirect("/questions/new");
  } catch (error) {
    return res.send("Error: " + error.message);
  }
};