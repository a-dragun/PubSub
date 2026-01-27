const User = require("../models/User");
const Question = require("../models/Question");
const categories = require('../config/categories');

exports.getCreateQuestionPage = async (req, res) => {
  try {
    return res.render("questions/create_question", {categories});
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};


exports.createQuestion = async (req, res) => {
  try {
    const { text, answer1, answer2, answer3, answer4, hint, image, category} = req.body;
    await Question.create({ text: text, answers: [answer1, answer2, answer3, answer4], authorId: req.session.user.id, status: 'pending', 'hint': hint, 'image': image, 'category': category});
    return res.redirect("/questions/new");
  } catch (error) {
    return res.status(500).render('error', { status: 500, message: error.message });
  }
};