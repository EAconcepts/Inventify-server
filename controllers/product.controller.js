const express = require("express");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

// Create Product
const createProduct = asyncHandler(async (req, res) => {
  const {
    noID,
    name,
    sku,
    location,
    costPrice,
    sellingPrice,
    quantity,
    images,
    category,
    size,
    description,
  } = req.body.product;
  console.log(req.body.product);

  if (
    !noID ||
    !name ||
    !costPrice ||
    !sellingPrice ||
    !quantity ||
    !description
  ) {
    res.status(400).json({ message: "Please fill all the required fields" });
    return;
  }
  //   Check if noID already exists
  const productExist = await Product.findOne({ noID: `${noID}ID` });
  if (productExist) {
    res.status(400).json({ message: "noID already exist!" });
    return;
  }
  //   Create new Product
  const newProduct = await Product.create({
    name,
    noID,
    costPrice,
    sellingPrice,
    quantity,
    location,
    images: images ? images : null,
    sku,
    category,
    size,
    description,
  });
  if (newProduct) {
    res
      .status(201)
      .json({ message: "Product created successfully!", data: newProduct });
  } else {
    res
      .status(500)
      .json({ message: "An error occured while creating product" });
  }
});

// Get Products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  if (products) {
    res.status(200).json({ message: "Success", data: products });
  } else {
    res.status(500).json({ message: "Unable to get products." });
  }
});

// Get a product
const getProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    res
      .status(200)
      .json({ message: "Product gotten successfully!", data: product });
  } else {
    res.status(400).json("Unable to get product");
  }
});

module.exports = { createProduct, getProducts, getProduct };
