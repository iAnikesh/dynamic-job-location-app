const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["jobseeker", "recruiter", "admin"], default: "jobseeker" },
  password: String,
  selectedLocation: {
      type: String,
      default: ""
  },

  resetOtp: String,
  resetOtpExpiry: Date
  
});

module.exports = mongoose.model("User", UserSchema);