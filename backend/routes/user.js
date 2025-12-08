// backend/routes/user.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// Update profile (complete profile)
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      phone,
      location,
      experienceLevel,
      industry,
      skills,
      bio,
      companyName,
      companyWebsite,
      companySize,
      companyDescription
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields based on role
    if (user.role === "jobseeker") {
      if (!phone || !location || !experienceLevel || !industry || !skills) {
        return res.status(400).json({
          message: "Phone, location, experience level, industry, and skills are required"
        });
      }

      user.jobSeekerProfile.experienceLevel = experienceLevel;
      user.jobSeekerProfile.industry = industry;
      user.jobSeekerProfile.skills = skills;
      user.jobSeekerProfile.bio = bio || "";
    } else if (user.role === "recruiter") {
      if (!phone || !location || !companyName || !companyDescription) {
        return res.status(400).json({
          message: "Phone, location, company name, and company description are required"
        });
      }

      user.recruiterProfile.companyName = companyName;
      user.recruiterProfile.companyWebsite = companyWebsite || "";
      user.recruiterProfile.companySize = companySize || "";
      user.recruiterProfile.companyDescription = companyDescription;
      user.recruiterProfile.companyLocation = { city: location };
    }

    // Update common fields
    user.phone = phone;
    user.profileComplete = true; // Mark profile as complete

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
        phone: user.phone,
        location: user.location,
        selectedLocation: user.selectedLocation,
        experienceLevel: user.experienceLevel,
        industry: user.industry,
        skills: user.skills,
        bio: user.bio,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companySize: user.companySize,
        companyDescription: user.companyDescription
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// Get profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetOtp -resetOtpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Save/Update selected job location
router.post("/location", auth, async (req, res) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    await User.findByIdAndUpdate(req.user.id, { jobSeekerProfile: { selectedLocation: location } });

    res.json({ message: "Location updated", location });
  } catch (error) {
    res.status(500).json({ message: "Failed to update location" });
  }
});

// Get selected location
router.get("/location", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ location: user.jobSeekerProfile.selectedLocation });
  } catch (error) {
    res.status(500).json({ message: "Failed to get location" });
  }
});

module.exports = router;