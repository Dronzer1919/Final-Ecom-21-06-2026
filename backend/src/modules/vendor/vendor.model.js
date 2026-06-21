const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    supplierCode: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    hasGST: {
      type: Boolean,
      default: false
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    location: {
      type: String,
      trim: true
    },
    locality: {
      type: String,
      trim: true
    },
    memberSince: {
      type: String,
      trim: true
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1
    },
    variety: {
      type: String,
      trim: true
    },
    isB2BVendor: {
      type: Boolean,
      default: true
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

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
