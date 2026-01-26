const mongoose = require('mongoose');

const HappyHourSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  multiplier: {
    type: Number,
    default: 1
  },
  startedAt: Date,
  endsAt: Date,
  activatedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  }
}, { timestamps: true });

module.exports = mongoose.model('HappyHour', HappyHourSchema);
