const mongoose = require("mongoose");


const questionSchema = new mongoose.Schema({
  authorId: {type: String, required: true},
  text: {type: String, required: true, unique: true},
  answers: {type: [String], required: true},
  status: {type: String, enum: ['approved', 'pending'], required: true},
  createdAt: {type: Date, default: Date.now, required: true}
});


const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
