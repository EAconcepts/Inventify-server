const express = require("express");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { generateOtp, generateToken } = require("../utils/utils");
const Otp = require("../models/otpModel");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email login - Ready to send mail
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  }
  if (success) {
    // console.log("Ready to send email");
    // console.log(success);
  }
});

const mailBody = (name, otp) => {
  return (html = `<div>
  <h2>Verify your account</h2>
  <p>Hello ${name}, we are pleased to welcome you onboard. We can wait to manage your inventory with you. Before we continue, please verify you account with the OTP code below.</p>
  <p style="letter-spacing: 12px;"><b> ${otp}</b></p>
  <br/>
  <small>If you have not requested for this OTP code, please disregard.</small>
  <br/>
  <br/>
  <p><b>Regards,</b></p>
  <p>Inventify Team.</p>
</div>
`);
};

const getMailOptions = (email, subject, html) => {
  const mailOptions = {
    sender: process.env.EMAIL,
    to: email,
    subject,
    html,
  };
  return mailOptions;
};

const sendVerificationMail = ({ _id, email, name }, res) => {
  // check if user is already verified
  User.findOne({ _id, isVerified: true })
    .then(async (user) => {
      // User already verified
      if (user) {
        // console.log(user);
        res
          .status(200)
          .json({ message: "User already verified. Please login to continue" });
      }
      // User is yet to be verified - Send verification mail
      else {
        const otp = generateOtp();
        // console.log(otp);
        let subject = "Inventify Account Verification";
        let html = mailBody(name, otp);
        // console.log(html);
        const date = Date.now() + 600000;
        const deleteOldOTp = await Otp.findOneAndDelete({ email });

        // Hash generated otp
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);
        if (hashedOtp) {
          console.log(hashedOtp);
          //  Store otp details
          Otp.create({
            email,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: date,
          })
            .then((result) => {
              // Otp storage success
              if (result) {
                const options = getMailOptions(email, subject, html);
                // console.log(options)

                transporter.sendMail(options, (error, success) => {
                  // Unable to send email
                  if (error) {
                    console.log(error);
                    res.status(400).json({
                      message: "An error occured while sending email",
                    });
                  }
                  // Email sent successfully
                  if (success) {
                    // Generate token
                    const token = generateToken(result._id);
                    res.status(201).json({
                      message:
                        "Verification email sent successfully. Please check your registered email to continue.",
                      token: token,
                    });
                  }
                });
              }
              // Could not store otp details
              else {
                res.status(500).json({
                  message: "An error occured while storing otp details",
                });
              }
            })
            // Error storing otp details
            .catch((error) => {
              console.log(error);
              res.status(500).json({
                message: "An error occured while storing otp details",
              });
            });
        }
      }
    })
    // Error checking verification status
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "An error occured while checking user verification status",
      });
    });
};

// Register new User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, telephone, password } = req.body;
  console.log(req.body);
  if (!name || !email || !password) {
    res
      .status(400)
      .json({ message: "Name, Email or Password cannot be empty!" });
  } else {
    // Check if user exists
    User.findOne({ email })
      .then(async (user) => {
        console.log(user);

        // User already exists
        if (user) {
          console.log(user);

          res.status(400).json({ message: "User with email already exist" });
        } else {
          // User never existed. Create a new user.
          const date = new Date();
          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          if (hashedPassword) {
            User.create({
              name,
              email,
              telephone,
              role: "user",
              createdAt: date,
              password: hashedPassword,
            })
              .then((newUser) => {
                if (newUser) {
                  console.log(newUser);
                  sendVerificationMail(newUser, res);
                }
              })
              //Error creating new user
              .catch((error) => {
                console.log(error);
                res.status(400).json({
                  message: "Error creating new user. Please try again.",
                });
              });
          } else {
            res
              .status(500)
              .json({ message: "An error occured while hashing password." });
          }
        }
      })
      .catch((error) => {
        // Error checking if user exists
        console.log(error);
        res.status(500).json({ message: "Error checking if user exist" });
      });
  }
});

const verifyAccount = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  console.log(otp);
  if (!otp || otp.length < 4) {
    res
      .status(400)
      .json({ message: "Please provide the four digits otp values" });
  } else {
    //check if user exists and already verified
    User.findOne({ email: req?.otp?.email })
      .then((exists) => {
        // User exists
        if (exists) {
          // Check if user is already verified
          User.findOne({ email: req.otp.email, isVerified: true })
            .then((result) => {
              // User already verified
              if (result) {
                res.status(200).json({
                  message: "User already verified. Please login to continue.",
                });
              } else {
                //verify user
                Otp.findOne({ _id: req.otp._id })
                  .then((data) => {
                    if (data) {
                      bcrypt
                        .compare(otp, data.otp)
                        .then((valid) => {
                          if (valid) {
                            // check if otp has not expired
                            const date = Date.now();
                            const expiryTime = new Date(data.expiresAt);
                            const currentTime = new Date(date);

                            if (currentTime < expiryTime) {
                              console.log("Not yet expired");

                              // Update user verification status
                              User.findOneAndUpdate(
                                { email: req.otp.email },
                                { isVerified: true },
                                { new: true }
                              )
                                .select("-password")
                                .then((data) => {
                                  if (data) {
                                    successMail(data);
                                    res.status(200).json({
                                      message:
                                        "Account verified successfully. Please login to proceed.",
                                    });
                                  } else {
                                    res.status(500).json({
                                      message:
                                        "Could not update verification status",
                                    });
                                  }
                                })
                                .catch((error) => {
                                  console.log(error);
                                  res.status(500).json({
                                    message:
                                      "An error occured while updating user verification status",
                                  });
                                });
                            }
                            //  OTP Expired
                            else {
                              res.status(400).json({
                                message: "Otp expired! Please try again.",
                              });
                            }
                          } else {
                            res.status(400).json({
                              message:
                                "Invalid OTP. Please confirm and try again.",
                            });
                          }
                        })
                        // Invalid OTP provided
                        .catch((error) => {
                          res
                            .status(400)
                            .json({ message: "Invalid token provided" });
                        })

                        .catch((error) => {
                          console.log(error);
                          res.status(500).json({
                            message:
                              "An error occured while validating OTP. Please try again",
                          });
                        });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                      message:
                        "An error occured while checking verification details",
                    });
                  });
              }
            })
            .catch((error) => {
              console.log(error);
              res.status(500).json({
                message:
                  "An error occured while checking user verification status",
              });
            });
        } else {
          res.status(400).json({ message: "User do not exist!" });
        }
      })
      .catch((error) => {
        console.log(error);
        res
          .status(500)
          .json({ message: "An error occured while checking user existence" });
      });

    // res.status(200).json(req.user)
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    // throw new Error("Please fill all fields");
    res.status(400).send({ message: "Please fill all fields" });
  } else {
    // Confirm user details
    User.findOne({ email })
      .then((user) => {
        if (user) {
          // if user exists
          // compare passwords
          // decrypt password
          bcrypt
            .compare(password, user.password)
            .then((result) => {
              if (result) {
                console.log(result);
                // Valid password
                // Check if user is verified
                User.findOne(
                  { _id: user._id, isVerified: true },
                  { password: 0 }
                )
                  .then((data) => {
                    // User is verified
                    if (data) {
                      // Generate token
                      const token = generateToken(user._id);
                      res.status(200).json({
                        message: "Login successful",
                        data,
                        token: token,
                      });
                    } else {
                      // User not verified
                      // Send verification email
                      sendVerificationMail(user, res);
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      message:
                        "An error occured while checking verification status",
                    });
                  });
              } else {
                // Invalid password
                res.status(400).json({ message: "Invalid email or password" });
              }
            })
            .catch((error) => {
              res.status(500).json({
                message: "An error occured while comparing passwords",
              });
            });
        } else {
          res.status(400).json({ message: "User do not exist" });
        }
      })
      .catch((error) => {
        res.status(400).json({
          message: "Could not find user.",
        });
      });
  }
});

const successMail = async ({ email, name }) => {
  let subject = "Verification Successful";
  let html = `<div>
  <h2>Account verification successful</h2>
  <p>Hello ${name}, thank you for verifying your account. You can now explore our platform and services</p>
  <br/>
  <p>Once again, we are pleased to have you aboard. You can access your dashboard from <a href="#">here</a> </p>
  <br/>
  <br/>
  <p><b>Regards,</b></p>
  <p>Inventify Team.</p>
</div>
`;
  const options = getMailOptions(email, subject, html);
  transporter.sendMail(options, (error, success) => {
    if (error) {
      console.log(error);
      // res.status(500).json({message: "An error occured while sending mail"})
    }
    if (success) {
      console.log(success);
    }
  });
};

module.exports = { registerUser, verifyAccount, loginUser };
