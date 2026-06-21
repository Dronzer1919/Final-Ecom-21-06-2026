const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters']
    },
    image: {
      type: String,
      required: [true, 'Image URL is required']
    },
    buttonText: {
      type: String,
      default: 'SHOP NOW',
      trim: true,
      maxlength: [50, 'Button text cannot exceed 50 characters']
    },
    buttonLink: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for sorting
bannerSchema.index({ order: 1, createdAt: -1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
