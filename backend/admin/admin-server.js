// admin/admin-server.js
require("dotenv").config({ path: require('path').join(__dirname, '../.env') });

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:5174",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"]
}));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[Admin Server] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body keys:', Object.keys(req.body));
  } else {
    console.log('Body is empty or undefined');
  }
  next();
});

app.use('/uploads', express.static('../backend/uploads'));

// Connect to same MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Admin Panel: MongoDB connected"))
  .catch((err) => console.log("Admin Panel DB Error:", err));

// Admin Routes
app.use("/api/admin/auth", require("./routes/auth"));
app.use("/api/admin/users", require("./routes/users"));
app.use("/api/admin/jobs", require("./routes/jobs"));
app.use("/api/admin/applications", require("./routes/applications"));
app.use("/api/admin/analytics", require("./routes/analytics"));

const ADMIN_PORT = 5001; // Forced to 5001 to avoid clash with AirPlay on 5000

app.listen(ADMIN_PORT, () =>
  console.log(`Admin Panel Server running on port ${ADMIN_PORT}`)
);