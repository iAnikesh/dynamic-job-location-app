const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification details
  type: {
    type: String,
    enum: ['application_update', 'new_job_match', 'interview_scheduled', 'message', 'approval', 'rejection', 'new_application'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Related references
  relatedJobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedApplicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Metadata
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Action link
  actionUrl: String,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Notification", NotificationSchema);