const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderNumber: {
    type: Date,
    default: Date.now(),
    required: true,
    unique: true,
  },
  date: {
    type: Date,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enums: ["on process", "waiting payment", "delivered", "canceled"],
    default: "waiting payment"
  },
}, {timestamp: true});


const orderModel = mongoose.model('Order', orderSchema)

module.exports = orderModel