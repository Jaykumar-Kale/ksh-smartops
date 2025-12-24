const Operation = require('../models/Operation');

// Simple linear regression forecast
function linearRegression(data) {
  const n = data.length;
  if (n < 2) return null;

  const x = data.map((_, i) => i + 1);
  const y = data;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope =
    (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// GET /forecast/monthly-ot
async function forecastMonthlyOT(req, res) {
  try {
    const data = await Operation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$operationDate' },
            month: { $month: '$operationDate' },
          },
          totalOTHours: { $sum: '$durationHours' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const hours = data.map(d => d.totalOTHours);

    const model = linearRegression(hours);
if (!model) {
  return res.json({
    historical: hours.map(h => Number(h.toFixed(2))),
    predictedNextMonth: Number(hours[0].toFixed(2)),
    note: 'Insufficient history; using last observed value as baseline forecast'
  });
}


    const nextIndex = hours.length + 1;
    const prediction =
      model.slope * nextIndex + model.intercept;

    res.json({
      historical: hours.map(h => Number(h.toFixed(2))),
      predictedNextMonth: Number(prediction.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { forecastMonthlyOT };
