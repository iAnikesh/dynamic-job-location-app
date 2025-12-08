const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'recruiter', 'admin'],
    default: 'jobseeker',
    required: true
  },
  avatar: String, // URL
  bio: String,

  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    lastUpdated: { type: Date, default: Date.now }
  },

  profileComplete: {
    type: Boolean,
    default: false
  },

  // Job Seeker specific fields
  jobSeekerProfile: {
    selectedLocation: {
      type: String,
      default: ""
    },
    skills: [String],
    experienceYears: Number,
    experienceLevel: { type: String, enum: ['entry', 'junior', 'mid', 'senior', 'expert'], default: 'entry' },
    industries: [String],
    preferredJobTypes: { type: [String], enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'] },
    resume: {
      url: String,
      uploadedAt: Date
    },
    portfolio: String, // URL
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      current: {
        type: Boolean,
        default: false
      }
    }],
    workExperience: [{
      company: String,
      position: String,
      description: String,
      startDate: Date,
      endDate: Date,
      current: {
        type: Boolean,
        default: false
      }
    }]
  },

  // Recruiter specific fields
  recruiterProfile: {
    companyName: String,
    companyWebsite: String,
    companyDescription: String,
    companyLogo: String,
    industry: String,
    companyLocation: {
      type: String,
      coordinates: [Number],
      address: String,
      city: String,
      state: String,
      country: String
    },
    businessRegistration: String, // Document URL
    verificationDocuments: [String]
  },

  resetOtp: String,
  resetOtpExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("User", UserSchema);