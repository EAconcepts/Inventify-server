const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"]
  },
  createdAt:{
    type: Date
  },
  role:{
    type: String,
    enums: ["admin", "user"]
  },
  email:{
    type: String,
    required: [true, 'Please enter a valid email'],
    unique: true
  },
  password:{
    type: String,
    required: [true, 'Password field cannot be empty']
  },
  telephone:{
    type: String,
  },
  isVerified:{
    type: Boolean,
    default: false
  }

}, {timestamp: true});

const userModel = mongoose.model('User', userSchema)
module.exports = userModel