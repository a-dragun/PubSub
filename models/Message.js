const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  body: { type: String, required: true, trim: true },
  type: { type: String, enum: ["text", "system"], default: "text" },
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
