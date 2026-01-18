const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  totalPoints: { type: Number, default: 0 },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "coowner", "member"], default: "member" }
  }],
  monthlyPoints: { type: Map, of: Number, default: {} }
}, { timestamps: true });

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
