const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adminLevel: { type: Number, default: 0, required: true },
  totalScore: { type: Number, default: 0 },
  friends: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  questionsApproved: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  mailbox: { type: [Object], default: [] },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
