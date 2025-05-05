const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const questionRoutes = require("./routes/questions");
const authMiddleware = require("./middleware/authMiddleware");
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/rooms");
const methodOverride = require("method-override");
const http = require('http');
const socketIO = require('socket.io');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server);
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false 
}));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/admin", authMiddleware.requireAuth, authMiddleware.checkAdminLevel(1), adminRoutes);
app.use("/questions", authMiddleware.requireAuth, questionRoutes);
app.use("/user", authMiddleware.requireAuth, userRoutes);
app.use("/rooms", authMiddleware.requireAuth, roomRoutes);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
