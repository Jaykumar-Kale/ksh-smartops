const Operation = require('../models/Operation');

/**
 * GET /analytics/warehouse
 * Warehouse-wise OT analytics
 * Optional query params: startDate, endDate (YYYY-MM-DD)
 */
async function getWarehouseAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.operationDate = {};
      if (startDate) matchStage.operationDate.$gte = new Date(startDate);
      if (endDate) matchStage.operationDate.$lte = new Date(endDate);
    }

    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$warehouseName',
          totalOTHours: { $sum: '$durationHours' },
          totalOTAmount: { $sum: '$otAmount' },
          operationCount: { $sum: 1 }, // ✅ FIXED
        },
      },
      {
        $project: {
          _id: 0,
          warehouseName: '$_id',
          totalOTHours: { $round: ['$totalOTHours', 2] },
          totalOTAmount: { $round: ['$totalOTAmount', 2] },
          operationCount: 1,
        },
      },
      { $sort: { totalOTHours: -1 } },
    ];

    const data = await Operation.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('getWarehouseAnalytics error:', error);
    return res.status(500).json({
      error: 'Failed to fetch warehouse analytics',
      details: error.message,
    });
  }
}

/**
 * GET /analytics/monthly-trend
 * Monthly OT trend (year-wise)
 * Query param: year (YYYY), defaults to current year
 */
async function getMonthlyTrend(req, res) {
  try {
    const year = req.query.year
      ? parseInt(req.query.year, 10)
      : new Date().getFullYear();

    const pipeline = [
      {
        $match: {
          operationDate: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$operationDate' },
            month: { $month: '$operationDate' },
          },
          totalOTHours: { $sum: '$durationHours' },
          totalOTAmount: { $sum: '$otAmount' },
          operationCount: { $sum: 1 }, // ✅ FIXED
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalOTHours: { $round: ['$totalOTHours', 2] },
          totalOTAmount: { $round: ['$totalOTAmount', 2] },
          operationCount: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ];

    const data = await Operation.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      year,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('getMonthlyTrend error:', error);
    return res.status(500).json({
      error: 'Failed to fetch monthly trend',
      details: error.message,
    });
  }
}

/**
 * GET /analytics/approval-status
 * Approval status summary
 * Optional query params: startDate, endDate
 */
async function getApprovalStatusSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.operationDate = {};
      if (startDate) matchStage.operationDate.$gte = new Date(startDate);
      if (endDate) matchStage.operationDate.$lte = new Date(endDate);
    }

    const pipeline = [
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$approvalStatus',
          totalOTHours: { $sum: '$durationHours' },
          totalOTAmount: { $sum: '$otAmount' },
          operationCount: { $sum: 1 }, // ✅ FIXED
        },
      },
      {
        $project: {
          _id: 0,
          approvalStatus: '$_id',
          totalOTHours: { $round: ['$totalOTHours', 2] },
          totalOTAmount: { $round: ['$totalOTAmount', 2] },
          operationCount: 1,
        },
      },
      { $sort: { approvalStatus: 1 } },
    ];

    const data = await Operation.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('getApprovalStatusSummary error:', error);
    return res.status(500).json({
      error: 'Failed to fetch approval status summary',
      details: error.message,
    });
  }
}

module.exports = {
  getWarehouseAnalytics,
  getMonthlyTrend,
  getApprovalStatusSummary,
};
