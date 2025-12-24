const express = require('express');
const multer = require('multer');
const { importOperations } = require('../controllers/operationsController');

const router = express.Router();

// Multer setup: store file in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only Excel files are allowed'));
  },
});

// POST /operations/upload - Upload Excel file for OT import
router.post('/upload', upload.single('file'), importOperations);

module.exports = router;
