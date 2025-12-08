const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

// Register with profile incomplete flag
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be between 3 and 15 characters and can only contain letters, numbers, and underscores"
      });
    }

    const usernameCheck = await User.findOne({ username: username.toLowerCase() });
    if (usernameCheck) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user with profileComplete = false
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hash,
      role,
      profileComplete: false
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return user data
    res.status(201).json({
      message: "Registration successful! Please complete your profile.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login with enhanced response
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return user data
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        selectedLocation: user.jobSeekerProfile?.selectedLocation,
        // Job seeker fields
        skills: user.jobSeekerProfile?.skills,
        // Recruiter fields
        companyName: user.recruiterProfile?.companyName,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Get current user (enhanced)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -resetOtp -resetOtpExpiry -lastLogin -createdAt -updatedAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        // Match standard structure used in login
        selectedLocation: user.jobSeekerProfile?.selectedLocation,
        skills: user.jobSeekerProfile?.skills,
        companyName: user.recruiterProfile?.companyName,
        recruiterProfile: user.recruiterProfile,
        jobSeekerProfile: user.jobSeekerProfile
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Forgot Password (OTP)
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h2>Your OTP: ${otp}</h2><p>This OTP will expire in 10 minutes.</p>`
    );

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Reset Password
router.post("/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetOtp: otp
    });

    if (!user || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
});

module.exports = router;