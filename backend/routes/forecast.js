const express = require('express');
const { forecastMonthlyOT } = require('../controllers/forecastController');

const router = express.Router();

router.get('/monthly-ot', forecastMonthlyOT);

module.exports = router;
