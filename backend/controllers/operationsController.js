const XLSX = require('xlsx');
const Operation = require('../models/Operation');

/**
 * Normalize Excel header keys
 */
function normalizeKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Validate Excel MIME types
 */
function isExcelMime(mimetype) {
  return (
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/octet-stream'
  );
}

/**
 * Convert Excel date / string / serial to JS Date
 */
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value)) return value;

  // Excel serial date
  if (typeof value === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + value * 86400000);
  }

  const d = new Date(value);
  return isNaN(d) ? null : d;
}

/**
 * Convert Excel time fraction to Date
 */
function timeFractionToDate(baseDate, fraction) {
  if (typeof fraction !== 'number') return null;
  const base = new Date(baseDate);
  if (isNaN(base)) return null;

  const ms = Math.round(fraction * 86400000);
  return new Date(base.getTime() + ms);
}

/**
 * Combine operation date with start/end time
 */
function combineDateAndTime(baseDate, timeVal) {
  if (!baseDate || !timeVal) return null;

  const dateObj = toDate(baseDate);
  if (!dateObj) return null;

  if (timeVal instanceof Date && !isNaN(timeVal)) {
    const result = new Date(dateObj);
    result.setHours(
      timeVal.getHours(),
      timeVal.getMinutes(),
      timeVal.getSeconds(),
      0
    );
    return result;
  }

  if (typeof timeVal === 'number') {
    return timeFractionToDate(dateObj, timeVal);
  }

  // HH:mm or HH:mm:ss
  const str = String(timeVal).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const s = match[3] ? parseInt(match[3], 10) : 0;

    const result = new Date(dateObj);
    result.setHours(h, m, s, 0);
    return result;
  }

  return toDate(timeVal);
}

/**
 * Map a single Excel row to Operation schema
 */
function mapRowToOperation(row) {
  const keys = Object.keys(row);
  const nmap = {};
  keys.forEach((k) => (nmap[normalizeKey(k)] = k));

  const pick = (variants) => {
    for (const v of variants) {
      const nk = normalizeKey(v);
      if (nmap[nk] !== undefined) return row[nmap[nk]];
    }
    return undefined;
  };

  const operationDateRaw = pick(['operationdate', 'date', 'otdate', 'workdate']);
  const warehouseName = pick(['warehouse', 'warehousename', 'site', 'location']);
  const customerName = pick(['customer', 'customername', 'client']);
  const employeeName = pick(['employee', 'employeename', 'staff', 'worker']);
  const contractorName = pick(['contractor', 'contractorname', 'vendor', 'agency']);
  const startTimeRaw = pick(['starttime', 'start', 'intime']);
  const endTimeRaw = pick(['endtime', 'end', 'outtime']);
  const otAmount = pick(['otamount', 'amount', 'otpay']);
  const approvalStatusRaw = pick(['approvalstatus', 'approval', 'status', 'approved']);
  const remarks = pick(['remarks', 'reason', 'note', 'notes']);
  const ratePerHour = pick(['rateperhour', 'rate']);

  const operationDate = toDate(operationDateRaw);
  const startTime = combineDateAndTime(operationDate, startTimeRaw);
  const endTime = combineDateAndTime(operationDate, endTimeRaw);

  let approvalStatus = 'pending';
  if (typeof approvalStatusRaw === 'string') {
    const s = approvalStatusRaw.trim().toLowerCase();
    if (['approved', 'yes', 'y'].includes(s)) approvalStatus = 'approved';
    else if (['rejected', 'no', 'n'].includes(s)) approvalStatus = 'rejected';
  }

  return {
    operationDate,
    warehouseName: warehouseName?.toString().trim(),
    customerName: customerName?.toString().trim(),
    employeeName: employeeName?.toString().trim(),
    contractorName: contractorName?.toString().trim(),
    startTime,
    endTime,
    otAmount: otAmount ? Number(otAmount) : undefined,
    approvalStatus,
    remarks: remarks?.toString().trim(),
    ratePerHour: ratePerHour ? Number(ratePerHour) : undefined,
  };
}

/**
 * POST /operations/upload
 * Import Excel OT data into MongoDB
 */
async function importOperations(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!isExcelMime(req.file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: 'buffer',
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return res.status(400).json({ error: 'No worksheet found' });
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // ✅ SAFETY CHECK (CORRECT SCOPE)
    if (rows.length > 5000) {
      return res.status(400).json({
        error: 'Excel file too large (max 5000 rows)',
      });
    }

    if (!rows.length) {
      return res.status(400).json({ error: 'No data rows found' });
    }

    const docs = [];
    const errors = [];

    rows.forEach((row, index) => {
      const op = mapRowToOperation(row);
      const missing = [];

      if (!op.operationDate) missing.push('operationDate');
      if (!op.warehouseName) missing.push('warehouseName');
      if (!op.customerName) missing.push('customerName');
      if (!op.employeeName) missing.push('employeeName');
      if (!op.startTime) missing.push('startTime');
      if (!op.endTime) missing.push('endTime');

      if (missing.length) {
        errors.push({
          row: index + 2,
          error: `Missing fields: ${missing.join(', ')}`,
        });
      } else {
        docs.push(op);
      }
    });

let savedCount = 0;

if (docs.length) {
  await Operation.insertMany(docs, { ordered: false });
  savedCount = docs.length; // ✅ correct and reliable
}


    return res.status(200).json({
      sheet: sheetName,
      totalRows: rows.length,
      savedCount,
      failedCount: rows.length - savedCount,
      preValidationErrors: errors,
    });
  } catch (err) {
    console.error('importOperations error:', err);
    return res.status(500).json({
      error: 'Failed to import operations',
      details: err.message,
    });
  }
}

module.exports = {
  importOperations,
};
