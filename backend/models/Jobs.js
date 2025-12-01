const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema({ 
    title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  company: String,
  
  // Recruiter reference
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiterName: String, // Denormalized
  companyLogo: String, // Denormalized
  
  // Job details
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'remote', 'hybrid', 'internship'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['onsite', 'remote', 'hybrid']
  },
  industry: String,
  category: String,
  
  // Requirements
  experienceRequired: {
    min: {
      type: Number,
      default: 0
    },
    max: Number
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'expert']
  },
  educationRequired: String,
  skills: [String],
  
  // Compensation
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  
  // Location (GeoJSON format)
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
    isRemote: {
      type: Boolean,
      default: false
    }
  },
  
  // Job settings
  openings: {
    type: Number,
    default: 1
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'filled'],
    default: 'active'
  },
  expiresAt: Date,
  
  // Application settings
  applicationDeadline: Date,
  applicationUrl: String,
  
  // Additional info
  benefits: [String],
  responsibilities: [String],
  qualifications: [String],
  
  // Metadata
  publishedAt: Date,
  closedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date
}, {
  timestamps: true
});

module.exports = mongoose.model("Job", JobSchema);