const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
  },
  createdAt:{
    type: Date
  },

}, {timestamp: true});

const categoryModel = mongoose.model('Category', categorySchema)
module.exports = categoryModel