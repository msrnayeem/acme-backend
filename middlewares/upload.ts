import multer from "multer";
import path from "path";
import fs from "fs";

// Define upload path
const uploadPath = path.join(__dirname, "..", "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Create multer instance
export const upload = multer({ storage });
export const uploadMultiple = upload.array("images", 10); // Allow up to 10 images
