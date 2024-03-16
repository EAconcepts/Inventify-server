const express = require('express')
const upload = require('../middleware/multer')
const { uploadFile } = require('../controllers/upload.controller')

const router = express.Router()

router.post('/image-upload', upload.array("images"), uploadFile)

module.exports = router