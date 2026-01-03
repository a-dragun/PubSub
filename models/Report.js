const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  reportedUserId: { type: String, required: true },
  reason: { type: String, required: true },
  reportedMessage: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", reportSchema);
