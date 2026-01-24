const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  type: { type: String, enum: ["direct", "team"], required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  createdAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
