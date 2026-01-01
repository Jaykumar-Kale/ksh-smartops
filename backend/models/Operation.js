const mongoose = require("mongoose");

const OperationSchema = new mongoose.Schema({
  warehouseName: { type: String, required: true },
  operationDate: { type: Date, required: true },
  durationHours: { type: Number, required: true },
  otAmount: { type: Number, required: true },
  approvalStatus: {
    type: String,
    enum: ["Approved", "Pending", "Rejected"],
    default: "Approved",
  },
});

module.exports = mongoose.model("Operation", OperationSchema);
