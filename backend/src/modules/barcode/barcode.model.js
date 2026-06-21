const mongoose = require('mongoose');

const barcodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Barcode symbology name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'Barcode symbology code is required'],
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

const Barcode = mongoose.model('Barcode', barcodeSchema);

module.exports = Barcode;
