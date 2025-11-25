const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.json({ message: "Email already exists" });

  const hash = await bcrypt.hash(password, 10);

  await User.create({ name, email, password: hash, role });

  res.json({ message: "Registered successfully!" });
});

// Login with Cookie
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ message: "Incorrect password" });

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ message: "Login successful", role: user.role });
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// Forgot Password (OTP)
router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  user.resetOtp = otp;
  user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP",
    `<h2>Your OTP: ${otp}</h2>`
  );

  res.json({ message: "OTP sent to email" });
});

// Reset Password
router.post("/reset", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email, resetOtp: otp });

  if (!user || user.resetOtpExpiry < Date.now())
    return res.json({ message: "Invalid or expired OTP" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtp = null;
  user.resetOtpExpiry = null;

  await user.save();

  res.json({ message: "Password reset successful" });
});

// GET /api/auth/me - returns logged in user's data
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;