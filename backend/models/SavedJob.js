const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SavedJobSchema = new Schema({ 
jobSeekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  jobTitle: String, // Denormalized
  companyName: String, // Denormalized
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model("SavedJob", ApplicationSchema);