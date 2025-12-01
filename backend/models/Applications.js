const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({ 
   jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobTitle: String, // Denormalized
  companyName: String, // Denormalized
  
  jobSeekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobSeekerName: String, // Denormalized
  jobSeekerEmail: String, // Denormalized
  
  recruiterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application details
  resume: String,
  coverLetter: String,
  expectedSalary: Number,
  availableFrom: Date,
  
  // Status tracking
  status: {
    type: String,
    enum: ['applied', 'viewed', 'shortlisted', 'interviewing', 'offered', 'rejected', 'accepted', 'withdrawn'],
    default: 'applied'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'interviewing', 'offered', 'rejected', 'accepted', 'withdrawn']
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  
  // Interview scheduling
  interviews: [{
    scheduledAt: Date,
    duration: Number, // minutes
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite']
    },
    location: String,
    meetingLink: String,
    interviewers: [String],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Recruiter notes
  recruiterNotes: [{
    note: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Rating (by recruiter)
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Location at time of application
  applicationLocation: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    distance: Number // Distance from job location in km
  },
  
  // Metadata
  appliedAt: {
    type: Date,
    default: Date.now
  },
  viewedAt: Date,
  respondedAt: Date,
  
  // Flags
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: Date,
  withdrawnReason: String
}, {
  timestamps: true

});

module.exports = mongoose.model("Application", ApplicationSchema);