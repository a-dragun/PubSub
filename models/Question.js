const mongoose = require("mongoose");
const categories = require('../config/categories');

const questionSchema = new mongoose.Schema({
  authorId: {type: String, required: true},
  text: {type: String, required: true, unique: true},
  answers: {type: [String], required: true},
  status: {type: String, enum: ['approved', 'pending'], required: true},
  hint: {type: String, required: true, default: ""},
  createdAt: {type: Date, default: Date.now, required: true},
  image: {type: String, default: ""},
  category: { type: String, enum: categories, required: true}
});


questionSchema.pre('validate', function (next) {

  if(this.hint == "" || this.hint == null) {
    let answerLength = this.answers[0].length;
    this.hint = this.answers[0][0];
    for(i=1;i<answerLength;i++) {
      if(this.answers[0][i] == ' ' || this.answers[0][i] == '.' || this.answers[0][i] == "'" || this.answers[0][i] == ":" || this.answers[0][i] == ",")
        this.hint += this.answers[0][i];
      else
      this.hint += ' _';
    }
  }

  switch (this.type) {
      case 'superfast':
      this.timeToAnswer = 8;
      this.timeBetweenQuestions = 1;
      this.points = 5;
      break;
      case 'fast':
      this.timeToAnswer = 20;
      this.timeBetweenQuestions = 5;
      this.points = 3;
      break;
      case 'slow':
      this.timeToAnswer = 30;
      this.timeBetweenQuestions = 5;
      this.points = 1;
      break;
}

  this.hintTime = Math.floor(this.timeToAnswer / 2);
  next();
});


const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
