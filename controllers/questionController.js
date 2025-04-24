const User = require("../models/User");
const Question = require("../models/Question")
const {isAuthenticated} = require("../middleware/authMiddleware")

exports.getCreateQuestion = async (req, res) => {

    if(isAuthenticated(req)) {res.render("questions/create_question");}
    else {
        res.redirect("/");
    }
};


exports.postCreateQuestion = async (req, res) => {
  if(isAuthenticated(req)) {
  const { text, answer1, answer2, answer3, answer4} = req.body;
  try {
    await Question.create({ text: text, answers: [answer1, answer2, answer3, answer4], authorId: req.session.user.id, status: 'pending' });
  } catch (error) {
    res.send("Error: " + error.message);
  }
  res.redirect("/questions/create");
}
else {
  res.redirect("/");
}
};