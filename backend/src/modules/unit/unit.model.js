const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Unit name is required'],
      trim: true,
      unique: true
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
      unique: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

unitSchema.index({ name: 1, shortName: 1 });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
