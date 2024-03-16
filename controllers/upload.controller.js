const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");

const uploadFile = asyncHandler(async (req, res) => {
  const allImages = req.files;
  const folderPath = "products";

  if (allImages.length > 0) {
    const promises = await allImages.map(
      async (file) =>
        new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "image", folder: folderPath },
              (error, result) => {
                if (error) {
                  console.log("line 12", error);
                  console.log(error);
                  reject(error);
                }
                console.log("line 17", result);
                resolve(result);
              }
            )
            .end(file.buffer);
        })
    );
    console.log(promises);
    const uploadedImages = await Promise.all(promises);

    if (uploadedImages) {
      console.log("line 25", uploadedImages);
      res
        .status(201)
        .json({ message: "Images upload successful!", data: uploadedImages });
    } else {
      res.status(500).json({ message: "Could not upload images" });
    }
  } else {
    res.status(400).json({ message: "Please provide images!" });
  }
});

module.exports = { uploadFile };
