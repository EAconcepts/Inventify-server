const express = require("express");
const { registerUser, verifyAccount, loginUser } = require("../controllers/user.controller");
const { verifyProtect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/verification", verifyProtect, verifyAccount);
router.post('/signin', loginUser)

module.exports = router;
