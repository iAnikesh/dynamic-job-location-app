// routes/user.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// Save/Update selected location
router.post("/location", auth, async (req, res) => {
  const { location } = req.body;

  if (!location)
    return res.status(400).json({ message: "Location is required" });

  await User.findByIdAndUpdate(req.user.id, { selectedLocation: location });

  return res.json({ message: "Location updated", location });
});

// Get user details (if not in /auth/me)
router.get("/location", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.json({ location: user.selectedLocation });
});

module.exports = router;