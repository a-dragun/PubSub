const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const questionRoutes = require("./routes/questions");
const reportRoutes = require("./routes/reports");
const friendsRoutes = require("./routes/friends");
const authMiddleware = require("./middleware/authMiddleware");
const cacheControl = require("./middleware/cacheControl");
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/rooms");
const methodOverride = require("method-override");
const http = require('http');
const socketIO = require('socket.io');

require('./jobs/scheduler');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
const { setupSocketHandlers } = require('./socket');
setupSocketHandlers(io);
app.set('io', io);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(cacheControl);

app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("view engine", "ejs");

// Use the new middleware to keep session in sync with DB and set locals
app.use(authMiddleware.updateUserSession);

app.use((req, res, next) => {
  // Fallback if session exists but user not found in DB (edge case) or just to be safe
  if (req.session && req.session.user && !res.locals.currentUser)
    res.locals.currentUser = req.session.user;
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/admin", authMiddleware.requireAuth, authMiddleware.checkBan, authMiddleware.checkAdminLevel(1), adminRoutes);
app.use("/questions", authMiddleware.requireAuth, authMiddleware.checkBan, questionRoutes);
app.use("/user", authMiddleware.requireAuth, authMiddleware.checkBan, userRoutes);
app.use("/rooms", authMiddleware.requireAuth, authMiddleware.checkBan, roomRoutes);
app.use("/friends", authMiddleware.requireAuth, authMiddleware.checkBan, friendsRoutes);
app.use("/news", require("./routes/news"));

app.use('/api/reports', authMiddleware.requireAuth, authMiddleware.checkBan, reportRoutes);


server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
