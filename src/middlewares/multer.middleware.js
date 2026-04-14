const multer = require("multer");

// ─── OLD CODE RESTORED (Same as before) ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ─── NEW CODE (For Diagnostic Pipeline / S3 / Reports) ────────────────────────
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = { upload, memoryUpload };