const mongoose = require("mongoose");
const categories = require('../config/categories');

const roomSchema = new mongoose.Schema ({
    name: {type: String, required: true},
    type: {type: String, enum: ['superfast', 'fast', 'slow'], required: true},
    maxUsers: {type: String, required: true, default: 10},
    timeToAnswer: {type: Number, required: true},
    timeBetweenQuestions: {type: Number, required: true, default: 4},
    currentQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    points: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now, required: true},
    categories: [{ type: String, enum: categories, required: true }]
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
