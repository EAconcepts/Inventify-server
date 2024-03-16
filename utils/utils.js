const jwt = require('jsonwebtoken')

// Generate OTP 
const generateOtp=()=>{
    const otp = (Math.floor(Math.random() * 9000) + 1000)
    console.log(otp)
    return otp.toString()
}

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
  };

module.exports = {generateOtp, generateToken}