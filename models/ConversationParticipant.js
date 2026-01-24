const mongoose = require("mongoose");

const conversationParticipantSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  joinedAt: { type: Date, default: Date.now },
  mutedAt: { type: Date, default: null }
});

const ConversationParticipant = mongoose.model("ConversationParticipant", conversationParticipantSchema);

module.exports = ConversationParticipant;
