const mongoose = require("mongoose");
const categories = require('../config/categories');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['superfast', 'fast', 'slow'], required: true },
    timeToAnswer: { type: Number, required: true },
    timeBetweenQuestions: { type: Number, required: true },
    points: { type: Number, required: true },
    hintTime: { type: Number, required: true },
    currentQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    createdAt: { type: Date, default: Date.now, required: true },
    categories: [{ type: String, enum: categories, required: true }],
    password: {type: String, default: null}
});
  
roomSchema.pre('validate', function (next) {
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
  

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
