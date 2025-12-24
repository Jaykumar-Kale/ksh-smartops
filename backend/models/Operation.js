const mongoose = require('mongoose');

// Warehouse Operation (OT) Schema
// Designed to reflect common Excel OT data captured in warehouses
// Includes validation and automatic duration calculation

const OperationSchema = new mongoose.Schema(
  {
    operationDate: {
      type: Date,
      required: true,
      index: true,
    },
    warehouseName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    contractorName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          // Ensure end time is after start time
          return this.startTime && v > this.startTime;
        },
        message: 'endTime must be after startTime',
      },
    },
    durationHours: {
      type: Number,
      min: 0,
      // Normalize to 2 decimal places when set manually
      set: (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v),
    },
    otAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    ratePerHour: {
        type: Number,
        min: 0,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Compute duration in hours automatically from start/end times
OperationSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime) {
    const ms = this.endTime - this.startTime;
    if (ms < 0) return next(new Error('endTime must be after startTime'));
    this.durationHours = Math.round((ms / 3600000) * 100) / 100; // 2 decimals
  }
  next();
});

// Helpful compound index for common queries
OperationSchema.index({ operationDate: 1, warehouseName: 1, employeeName: 1 });

module.exports = mongoose.model('Operation', OperationSchema);
