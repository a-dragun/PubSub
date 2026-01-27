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
const newsRoutes = require("./routes/news");
const teamsRoutes = require("./routes/teams");
const teamJoinRequestsRoutes = require("./routes/teamJoinRequests");
const messagingRoutes = require("./routes/messaging");
const conversationRoutes = require("./routes/conversation");
const happyHourRoutes = require("./routes/happyHour");
const HappyHour = require('./models/HappyHour');
const methodOverride = require("method-override");
const http = require('http');
const socketIO = require('socket.io');
const { setupMessagingSocket } = require("./messagingSocket");
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
sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
});
app.use(sessionMiddleware);

app.use(cacheControl);

app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("view engine", "ejs");
app.use(authMiddleware.updateUserSession);

app.use((req, res, next) => {
  if (req.session && req.session.user && !res.locals.currentUser)
    res.locals.currentUser = req.session.user;
  next();
});

app.use(async (req, res, next) => {
  try {
    const hh = await HappyHour.findOne({ isActive: true });
    if (hh && new Date() < new Date(hh.endsAt)) {
      res.locals.globalHappyHour = hh;
    } else {
      res.locals.globalHappyHour = null;
    }
  } catch (err) {
    res.locals.globalHappyHour = null;
  }
  next();
});



io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, () => {
    if (!socket.request.session || !socket.request.session.user) {
      return next(new Error("Unauthorized"));
    }
    socket.user = socket.request.session.user;
    next();
  });
});

const messagingNamespace = io.of("/messaging");
messagingNamespace.use((socket, next) => {
  sessionMiddleware(socket.request, {}, () => {
    if (!socket.request.session || !socket.request.session.user) {
      return next(new Error("Unauthorized"));
    }
    socket.user = socket.request.session.user;
    next();
  });
});

setupMessagingSocket(io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.name);
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
app.use("/news", newsRoutes);
app.use("/teams", authMiddleware.requireAuth, teamsRoutes);
app.use("/team-join-requests", authMiddleware.requireAuth, teamJoinRequestsRoutes);
app.use("/api/happy-hour", authMiddleware.requireAuth, authMiddleware.checkBan, authMiddleware.checkAdminLevel(2), happyHourRoutes);
app.use('/api/reports', authMiddleware.requireAuth, authMiddleware.checkBan, reportRoutes);
app.use('/api/messaging', authMiddleware.requireAuth, authMiddleware.checkBan, messagingRoutes);
const feedbackRoutes = require("./routes/feedback");

app.use('/api/conversation', authMiddleware.requireAuth, authMiddleware.checkBan, conversationRoutes);
app.use('/support', authMiddleware.requireAuth, authMiddleware.checkBan, feedbackRoutes);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
