const Operation = require('../models/Operation');

const importOperations = async (req, res) => {
  return res.status(200).json({
    message: 'Upload endpoint working',
  });
};

module.exports = { importOperations };
