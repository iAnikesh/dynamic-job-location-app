const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationHistorySchema = new Schema({
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String
  },
  
  // Activity context
  activityType: {
    type: String,
    enum: ['job_search', 'application', 'interview', 'manual_update']
  },
  relatedJobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedApplicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application'
  },
  
  accuracy: Number // GPS accuracy in meters
}, {
  timestamps: true
 });

module.exports = mongoose.model("LocationHistory", LocationHistorySchema);