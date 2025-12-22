// backend/routes/user.js
const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// Update profile (complete profile)
const upload = require("../middleware/uploadMiddleware");
router.patch("/profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'businessRegistration', maxCount: 1 },
  { name: 'verificationDocuments', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      name, bio, phone, address, city, state, zip, country,
      experienceYears, experienceLevel, skills,
      preferedJobType, portfolio, institution, degree, fieldOfStudy,
      educationStartDate, educationEndDate, educationCurrent,
      company, position, workExperienceDescription,
      workExperienceStartDate, workExperienceEndDate, workExperienceCurrent,
      companyName, companyWebsite, companyDescription,
      companyAddress, companyCity, companyState, companyCountry, companyZip,
      latitude, longitude, companyLatitude, companyLongitude
    } = req.body;

    // Extract industries from body (might be string or array)
    const industries = req.body.industries;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Helper to parser JSON if needed
    const safeParseJSON = (str) => {
      try { return JSON.parse(str); } catch (e) { return str; }
    };

    // Update common fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Handle File Uploads
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    if (req.files) {
      if (req.files['avatar']) user.avatar = baseUrl + req.files['avatar'][0].filename;

      if (user.role === 'jobseeker') {
        if (req.files['resume']) {
          user.jobSeekerProfile.resume = { url: baseUrl + req.files['resume'][0].filename, uploadedAt: new Date() };
        }
      } else if (user.role === 'recruiter') {
        if (req.files['companyLogo']) user.recruiterProfile.companyLogo = baseUrl + req.files['companyLogo'][0].filename;
        if (req.files['businessRegistration']) user.recruiterProfile.businessRegistration = baseUrl + req.files['businessRegistration'][0].filename;
        if (req.files['verificationDocuments']) {
          const docs = req.files['verificationDocuments'].map(f => baseUrl + f.filename);
          user.recruiterProfile.verificationDocuments = docs;
        }
      }
    }

    if (user.role === 'jobseeker') {
      const jp = user.jobSeekerProfile;
      if (bio) jp.bio = bio;
      if (experienceYears) jp.experienceYears = Number(experienceYears);
      if (experienceLevel) jp.experienceLevel = experienceLevel;
      if (experienceLevel) jp.experienceLevel = experienceLevel;
      // Handle Industries (Array)
      if (industries) {
        jp.industries = Array.isArray(industries) ? industries : [industries];
      }
      if (preferedJobType) jp.preferedJobType = preferedJobType;
      if (portfolio) jp.portfolio = portfolio;

      if (skills) {
        jp.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Location
      if (address) {
        const locUpdate = { address, city, state, zipCode: zip, country };
        if (latitude && longitude) {
          locUpdate.type = 'Point';
          locUpdate.coordinates = [Number(longitude), Number(latitude)];
        }
        user.location = { ...user.location, ...locUpdate };
      }

      // Simple single-entry update for Education if provided
      if (institution) {
        jp.education = [{
          institution, degree, fieldOfStudy,
          startDate: educationStartDate, endDate: educationEndDate,
          current: String(educationCurrent) === 'true'
        }];
      }

      // Simple single-entry update for Work Experience if provided
      if (company) {
        jp.workExperience = [{
          company, position, description: workExperienceDescription,
          startDate: workExperienceStartDate, endDate: workExperienceEndDate,
          current: String(workExperienceCurrent) === 'true'
        }];
      }
    } else if (user.role === 'recruiter') {
      const rp = user.recruiterProfile;
      if (companyName) rp.companyName = companyName;
      if (companyWebsite) rp.companyWebsite = companyWebsite;
      if (companyDescription) rp.companyDescription = companyDescription;
      if (companyDescription) rp.companyDescription = companyDescription;
      // if (recruiterIndustry) rp.industry = recruiterIndustry; // Removed

      // Company Location
      if (companyAddress) {
        const compLocUpdate = {
          address: companyAddress, city: companyCity, state: companyState,
          country: companyCountry, zipCode: companyZip
        };
        if (companyLatitude && companyLongitude) {
          compLocUpdate.type = 'Point';
          compLocUpdate.coordinates = [Number(companyLongitude), Number(companyLatitude)];
        }
        rp.companyLocation = compLocUpdate;
      }
    }

    user.profileComplete = true;
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      bio,
      phone,
      address,
      city,
      state,
      zip,
      country,
      experienceYears,
      experienceLevel,
      companyName,
      companyWebsite,
      companyDescription,
      // recruiterIndustry, // Removed
      companyAddress,
      companyCity,
      companyState,
      companyCountry,
      companyZip,
      businessRegistration,
      verificationDocuments,
      latitude,
      longitude,
      companyLatitude,
      companyLongitude
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle File Uploads
    if (req.files) {
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;

      if (req.files['avatar']) {
        user.avatar = baseUrl + req.files['avatar'][0].filename;
      }

      if (req.files['resume']) {
        user.jobSeekerProfile.resume = {
          url: baseUrl + req.files['resume'][0].filename,
          uploadedAt: new Date()
        };
      }

      if (req.files['companyLogo']) {
        user.recruiterProfile.companyLogo = baseUrl + req.files['companyLogo'][0].filename;
      }
    }

    // Validate required fields based on role
    if (user.role === "jobseeker") {
      // NOTE: Removed strict validation for demo purposes to allow partial updates if needed, 
      // but in production, uncomment the validation logic.
      /*
     if (!phone || !experienceLevel || !industry || !skills) {
       return res.status(400).json({
         message: "Phone, experience level, industry, and skills are required"
       });
     }
     */

      if (name) user.name = name; // Update common name field
      if (name) user.name = name; // Update common name field
      if (experienceLevel) user.jobSeekerProfile.experienceLevel = experienceLevel;

      // Handle Industries payload
      if (req.body.industries) {
        user.jobSeekerProfile.industries = Array.isArray(req.body.industries) ? req.body.industries : [req.body.industries];
      } else if (req.body.industry) {
        // Fallback for legacy calls or malformed data
        user.jobSeekerProfile.industries = Array.isArray(req.body.industry) ? req.body.industry : [req.body.industry];
      }

      if (skills) {
        // If came from multipart form, it might be a string "react, node"
        // If JSON, it might be array.
        if (typeof skills === 'string') {
          user.jobSeekerProfile.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(skills)) {
          user.jobSeekerProfile.skills = skills;
        }
      }

      if (bio) user.jobSeekerProfile.bio = bio || "";
      if (phone) user.phone = phone; // Common phone

      // Address update
      if (address) {
        const locationUpdate = {
          address, city, state, zipCode: zip, country
        };
        if (latitude && longitude) {
          locationUpdate.type = 'Point';
          locationUpdate.coordinates = [Number(longitude), Number(latitude)];
        }
        user.location = {
          ...user.location,
          ...locationUpdate
        };
      }

      if (institution) {
        user.jobSeekerProfile.education = [{
          institution, degree, fieldOfStudy, startDate: educationStartDate, endDate: educationEndDate, current: educationCurrent === 'true'
        }];
      }

      if (company) {
        user.jobSeekerProfile.workExperience = [{
          company, position, description: workExperienceDescription, startDate: workExperienceStartDate, endDate: workExperienceEndDate, current: workExperienceCurrent === 'true'
        }];
      }

      user.jobSeekerProfile.portfolio = portfolio;

    } else if (user.role === "recruiter") {
      // NOTE: Removed strict validation for demo purposes to allow partial updates if needed, 
      // but in production, uncomment the validation logic.
      /*
      if (!phone || !location || !companyName || !companyDescription) {
        return res.status(400).json({
          message: "Phone, location, company name, and company description are required"
        });
      }
      */
      if (name) user.name = name; // Update common name field
      if (companyName) user.recruiterProfile.companyName = companyName;
      if (companyWebsite) user.recruiterProfile.companyWebsite = companyWebsite || "";
      if (companyDescription) user.recruiterProfile.companyDescription = companyDescription;
      if (companyDescription) user.recruiterProfile.companyDescription = companyDescription;
      // if (recruiterIndustry) user.recruiterProfile.industry = recruiterIndustry; // Removed

      if (companyAddress) {
        const locationUpdate = {
          address: companyAddress,
          city: companyCity,
          state: companyState,
          country: companyCountry,
          zipCode: companyZip
        };
        if (companyLatitude && companyLongitude) {
          locationUpdate.type = 'Point';
          locationUpdate.coordinates = [Number(companyLongitude), Number(companyLatitude)];
        }
        user.recruiterProfile.companyLocation = locationUpdate;
      }
      if (businessRegistration) user.recruiterProfile.businessRegistration = businessRegistration;
      if (verificationDocuments) user.recruiterProfile.verificationDocuments = verificationDocuments;
    }

    // Update common fields
    if (phone) user.phone = phone;
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
        avatar: user.avatar, // Return avatar URL
        // Returning simplified structure for frontend context
        ...user._doc
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

router.get("/profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password -resetOtp -resetOtpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "recruiter") {
      return res.status(404).json({ message: "Access Denied" });
    }

    if (user.role === "jobSeeker") {
      user.jobSeekerProfile.avatar = user.jobSeekerProfile.avatar.replace("/uploads/", "http://localhost:4000/uploads/");
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

// Change password
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();

    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// Request email change (send OTP)
router.post("/request-email-change", auth, async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email already exists (case-insensitive)
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${newEmail}$`, 'i') },
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP and new email temporarily
    user.emailChangeOtp = otp;
    user.emailChangeOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.pendingEmail = newEmail;

    await user.save();

    // Send OTP email
    const sendEmail = require("../utils/sendEmail");
    await sendEmail(
      newEmail,
      "Verify Your New Email Address",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Change Verification</h2>
          <p>You have requested to change your email address.</p>
          <p>Your verification code is:</p>
          <h1 style="background-color: #f0f0f0; padding: 20px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this change, please ignore this email.</p>
        </div>
      `
    );

    res.json({ message: "OTP sent to new email address" });
  } catch (error) {
    console.error("Request email change error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify email change OTP
router.post("/verify-email-change", auth, async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emailChangeOtp || !user.emailChangeOtpExpiry || !user.pendingEmail) {
      return res.status(400).json({ message: "No pending email change request" });
    }

    // Check if OTP expired
    if (Date.now() > user.emailChangeOtpExpiry) {
      user.emailChangeOtp = undefined;
      user.emailChangeOtpExpiry = undefined;
      user.pendingEmail = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    // Verify OTP
    if (user.emailChangeOtp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Update email
    user.email = user.pendingEmail;
    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpiry = undefined;
    user.pendingEmail = undefined;
    user.updatedAt = Date.now();

    await user.save();

    res.json({ message: "Email changed successfully", email: user.email });
  } catch (error) {
    console.error("Verify email change error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

module.exports = router;