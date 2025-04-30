const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adminLevel: { type: Number, enum: [0, 1, 2], default: 0, required: true },
  totalScore: { type: Number, default: 0 },
  questionsApproved: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banDuration: {type: Date, default: null},
  muteDuration: {type: Date, default: null},
  banReason: {type: String, default: null},
  muteReason: {type: String, default: null},
  profilePicture: {type: String, default: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
