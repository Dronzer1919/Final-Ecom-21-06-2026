const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      trim: true,
      unique: true,
      uppercase: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String
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

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
