const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    noID: {
      type: String,
      required: [true, "Please provide a noID"],
      unique: [true, "noID already exist"],
    },
    name: {
      type: String,
      required: [true, "Please enter a product name"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    category: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Category",
    },
    images: [
      {
        type: String,
      },
    ],
    quantity: {
      type: Number,
      required: [true, "please enter product quantity"],
    },
    location: {
      type: String,
    },
    size: {
      type: String,
    },
    costPrice: {
      type: Number,
    },
    sellingPrice: {
      typwe: Number,
    },
    sold: {
      type: Boolean,
      default: false,
    },
    sku: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Please provide a detailed description"],
      minLength: [40, "Description too short, got {VALUE}"],
    },
  },
  { timestamp: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("noID")) {
    this.noID = this.noID + "ID";
  }
  next();
});

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;
