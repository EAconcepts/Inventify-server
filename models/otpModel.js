const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true
  },
}, {timestamp: true});

const otpModel = mongoose.model('Otp', otpSchema)

module.exports = otpModel