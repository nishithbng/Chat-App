import multer from "multer";

const storage = multer.memoryStorage(); // keep files in memory for Cloudinary

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image!"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
