const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending"
    },
    createdAt: { type: Date, default: Date.now }
});
  

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = Friendship;
