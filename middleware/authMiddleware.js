const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");

const protect = asyncHandler(async (req, res, next) => {
  // Extract token from headers

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // validate token
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log(verified.id);
      if (verified) {
        req.user = await User.findOne({ _id: verified.id });
        next();
      }
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json({ message: "Access denined. Invalid token provided" });
    }
  } else {
    res.status(400).json({ message: "Access denied. No token provided" });
  }
});

const verifyProtect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token and verify
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded.id);
      //   fetch otp details
      if (decoded) {
        const otp = await Otp.findOne({ _id: decoded.id });
        if (otp) {
          console.log("inside otp");
          req.otp = otp;
          next();
        } else {
          res.status(400).json("Access Denied. Invalid Token provided");
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Access Denied. Invalid token provided." });
    }
  }
  //   No token
  else {
    res.status(400).json({ message: "Access Denied. No token provided." });
  }
});

module.exports = { protect, verifyProtect };
