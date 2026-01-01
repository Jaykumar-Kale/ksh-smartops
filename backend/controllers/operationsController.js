const xlsx = require("xlsx");
const fs = require("fs");
const Operation = require("../models/Operation");

const uploadOperations = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let savedCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      try {
        await Operation.create({
          warehouseName: row.warehouseName,
          operationDate: new Date(row.operationDate),
          durationHours: Number(row.durationHours),
          otAmount: Number(row.otAmount),
          approvalStatus: row.approvalStatus || "Pending",
        });
        savedCount++;
      } catch (err) {
        failedCount++;
      }
    }

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      totalRows: rows.length,
      savedCount,
      failedCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = { uploadOperations };
