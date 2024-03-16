// const asyncHandler = require("express-async-handler");

const errorHandler = (err, req, res, next) => {
  console.log("Hello from error handler")
  const status = res.statusCode ? res.statusCode : (res.statusCode = 500);
  res.status(status);
  res.json({ message: err.message });
  next();
}

module.exports = errorHandler;
