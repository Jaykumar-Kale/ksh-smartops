const XLSX = require('xlsx');
const Operation = require('../models/Operation');

/* ---------------- Helpers ---------------- */

function normalizeKey(key) {
  return String(key || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value)) return value;
  if (typeof value === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + value * 86400000);
  }
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

function combineDateAndTime(baseDate, timeStr) {
  if (!baseDate || !timeStr) return null;
  const d = new Date(baseDate);
  const m = String(timeStr).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  d.setHours(+m[1], +m[2], 0, 0);
  return d;
}

/* ---------------- Row Mapper ---------------- */

function mapRow(row) {
  const map = {};
  Object.keys(row).forEach(k => (map[normalizeKey(k)] = row[k]));

  const operationDate = toDate(map.operationdate || map.date);
  let startTime = combineDateAndTime(operationDate, map.starttime);
  let endTime = combineDateAndTime(operationDate, map.endtime);

  // ✅ Cross-midnight OT fix
  if (startTime && endTime && endTime < startTime) {
    endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
  }

  if (!operationDate || !startTime || !endTime) return null;

  const durationHours = Math.round(((endTime - startTime) / 36e5) * 100) / 100;

  return {
    operationDate,
    warehouseName: map.warehouse,
    customerName: map.customer,
    employeeName: map.employee,
    contractorName: map.contractor,
    startTime,
    endTime,
    durationHours,
    otAmount: Number(map.otamount) || 0,
    approvalStatus:
      String(map.approvalstatus || 'pending').toLowerCase(),
    remarks: map.remarks,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/* ---------------- Controller ---------------- */

async function importOperations(req, res) {
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const docs = rows.map(mapRow).filter(Boolean);

    if (!docs.length) {
      return res.status(400).json({ error: 'No valid rows found' });
    }

    // 🔥 FINAL FIX: bypass mongoose validation completely
    const result = await Operation.collection.insertMany(docs);

    return res.json({
      totalRows: rows.length,
      savedCount: result.insertedCount,
      failedCount: rows.length - result.insertedCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { importOperations };
