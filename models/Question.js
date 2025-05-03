const mongoose = require("mongoose");
const categories = require('../config/categories');

const questionSchema = new mongoose.Schema({
  authorId: {type: String, required: true},
  text: {type: String, required: true, unique: true},
  answers: {type: [String], required: true},
  status: {type: String, enum: ['approved', 'pending'], required: true},
  hint: {type: String, default: ""},
  createdAt: {type: Date, default: Date.now, required: true},
  image: {type: String, default: ""},
  category: { type: String, enum: categories, required: true}
});


const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
