const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
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
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
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

  selectedLocation: {
    type: String,
    default: ""
  },

   // Job Seeker specific fields
  jobSeekerProfile: {
    skills: [String],
    experienceYears: Number,
    experienceLevel: {type: String, enum: ['entry', 'junior', 'mid', 'senior', 'expert'], default: 'entry'},
    industries: [String],
    preferredJobTypes: {type: [String], enum: ['full-time', 'part-time', 'contract', 'remote', 'internship']},
    preferredRadius: {
      type: Number,
      default: 25 // kilometers
    },
    expectedSalaryMin: Number,
    expectedSalaryMax: Number,
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
    companySize: {type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501+']},
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