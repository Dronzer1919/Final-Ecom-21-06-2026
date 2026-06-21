const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Store & Warehouse
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store is required']
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required']
  },
  
  // Product Type
  productType: {
    type: String,
    enum: ['single', 'variable'],
    default: 'single'
  },
  
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  productName: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true  // Allow multiple null values
  },
  sku: {
    type: String,
    // required: [true, 'SKU is required'],  // Made optional - can be auto-generated
    unique: true,
    trim: true,
    sparse: true  // Allow multiple null values
  },
  sellingType: {
    type: String,
    // required: [true, 'Selling type is required'],  // Made optional
    trim: true
  },
  
  // Category Information
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: [true, 'Sub-category is required']
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Unit is required']
  },
  
  // Code & Barcode
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    trim: true
  },
  barcodeSymbology: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barcode',
    required: [true, 'Barcode symbology is required']
  },
  
  // Description
  description: {
    type: String,
    trim: true
  },
  
  // Images
  images: [{
    type: String
  }],
  
  // Pricing & Stock
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Tax & Discount
  taxType: {
    type: String,
    required: [true, 'Tax type is required'],
    trim: true
  },
  discountType: {
    type: String,
    required: [true, 'Discount type is required'],
    trim: true
  },
  discountValue: {
    type: Number,
    default: 0,
    min: [0, 'Discount value cannot be negative']
  },
  
  // Alert & Status
  quantityAlert: {
    type: Number,
    required: [true, 'Quantity alert is required'],
    default: 10,
    min: [0, 'Quantity alert cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  
  // Warranty & Manufacturing
  warranty: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  manufacturedDate: {
    type: Date
  },
  expiryOn: {
    type: Date
  },
  
  // B2B Settings
  isB2B: {
    type: Boolean,
    default: false
  },
  variety: {
    type: String,
    trim: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  bulkPricing: [{
    quantity: { type: Number, required: true },
    unit: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 }
  }],
  supplierLocation: {
    type: String,
    trim: true
  },
  responseRate: {
    type: Number,
    min: 0,
    max: 100
  },
  hasGST: {
    type: Boolean,
    default: false
  },

  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ name: 'text', productName: 'text', description: 'text', itemCode: 'text' });
productSchema.index({ category: 1, subCategory: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
// Note: slug and sku already have unique indexes from field definitions

// Virtual for checking low stock
productSchema.virtual('isLowStock').get(function() {
  return this.quantity < this.quantityAlert;
});

// Virtual for checking expired
productSchema.virtual('isExpired').get(function() {
  return this.expiryOn && this.expiryOn < new Date();
});

// Method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.status === 'Active' && 
         this.quantity > 0 && 
         !this.isDeleted && 
         (!this.expiryOn || this.expiryOn > new Date());
};

// Pre-save hook to generate slug from product name if not provided
productSchema.pre('save', function(next) {
  if (!this.slug) {
    // Generate slug from productName or name field
    const nameToUse = this.productName || this.name;
    if (nameToUse) {
      this.slug = nameToUse
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
