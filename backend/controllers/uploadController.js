const XLSX = require("xlsx");
const Operation = require("../models/Operation");

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rows.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const validRecords = [];
    let skipped = 0;

    for (const row of rows) {
      // 🔹 FLEXIBLE COLUMN MAPPING (MATCH YOUR EXCEL)
      const warehouseName =
        row.warehouseName ||
        row.Warehouse ||
        row["Warehouse Name"];

      const operationDate =
        row.operationDate ||
        row.Date ||
        row["Operation Date"];

      const durationHours =
        row.durationHours ||
        row["OT Hours"] ||
        row.OTHours;

      const otAmount =
        row.otAmount ||
        row["OT Amount"] ||
        row.Amount;

      if (!warehouseName || !operationDate || !durationHours || !otAmount) {
        skipped++;
        continue;
      }

      const parsedDate = new Date(operationDate);
      const parsedHours = Number(durationHours);
      const parsedAmount = Number(otAmount);

      if (
        isNaN(parsedDate.getTime()) ||
        isNaN(parsedHours) ||
        isNaN(parsedAmount)
      ) {
        skipped++;
        continue;
      }

      validRecords.push({
        warehouseName,
        operationDate: parsedDate,
        durationHours: parsedHours,
        otAmount: parsedAmount,
        approvalStatus: row.approvalStatus || row.Status || "Approved",
      });
    }

    if (!validRecords.length) {
      return res.status(400).json({
        message: "No valid rows found in Excel file",
      });
    }

    await Operation.insertMany(validRecords);

    return res.status(200).json({
      success: true,
      saved: validRecords.length,
      skipped,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
};
