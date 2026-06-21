const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'Brand code is required'],
      trim: true,
      unique: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    logo: {
      type: String
    },
    website: {
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

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
