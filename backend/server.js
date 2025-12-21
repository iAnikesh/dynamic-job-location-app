require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/notifications", require("./routes/notifications"));

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);