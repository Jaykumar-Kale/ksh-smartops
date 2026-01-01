const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const Operation = require("../models/Operation");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const results = [];

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        // 🔥 Flexible column mapping (Excel / CSV friendly)
        const warehouseName =
          row.warehouseName ||
          row["Warehouse Name"] ||
          row["Warehouse"] ||
          row["warehouse"];

        const dateValue =
          row.operationDate ||
          row["Operation Date"] ||
          row["Date"];

        if (!warehouseName || !dateValue) return;

        const parsedDate = new Date(dateValue);
        if (isNaN(parsedDate)) return;

        const durationHours = Number(
          row.durationHours || row["OT Hours"] || row["Hours"] || 0
        );

        const otAmount = Number(
          row.otAmount || row["OT Amount"] || row["Amount"] || 0
        );

        if (isNaN(durationHours) || isNaN(otAmount)) return;

        results.push({
          warehouseName: warehouseName.trim(),
          operationDate: parsedDate,
          durationHours,
          otAmount,
          approvalStatus: row.approvalStatus || row["Status"] || "Approved",
        });
      })
      .on("end", async () => {
        fs.unlinkSync(req.file.path);

        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid rows found in CSV",
          });
        }

        const saved = await Operation.insertMany(results);

        res.json({
          success: true,
          message: "Upload successful",
          saved: saved.length,
        });
      });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;
