const express = require('express');
const {
  getWarehouseAnalytics,
  getMonthlyTrend,
  getApprovalStatusSummary,
} = require('../controllers/analyticsController');

const router = express.Router();

// GET /analytics/warehouse - Warehouse-wise total OT hours and amount
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/warehouse', getWarehouseAnalytics);

// GET /analytics/monthly-trend - Monthly OT trend
// Query params: ?year=YYYY (defaults to current year)
router.get('/monthly-trend', getMonthlyTrend);

// GET /analytics/approval-status - Approval status summary
// Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/approval-status', getApprovalStatusSummary);

module.exports = router;
