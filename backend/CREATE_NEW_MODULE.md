# Creating New Modules Guide

This guide shows how to create new API modules following the same structure as the auth module.

## 📋 Module Structure Template

When creating a new module (e.g., Products, Categories, Orders), follow this structure:

```
backend/src/
├── models/
│   └── [Module].js          # Mongoose schema
├── controllers/
│   └── [module].controller.js    # Business logic
├── routes/
│   └── [module].routes.js        # API endpoints
└── middleware/
    └── [module].middleware.js    # Module-specific middleware (optional)
```

## 🏗️ Example: Creating a Product Module

### Step 1: Create Product Model

**File: `src/models/Product.js`**

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  minStock: {
    type: Number,
    default: 10
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'liter', 'meter', 'box'],
    default: 'piece'
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.costPrice && this.price) {
    return ((this.price - this.costPrice) / this.costPrice * 100).toFixed(2);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStock) return 'low_stock';
  return 'in_stock';
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
```

### Step 2: Create Product Controller

**File: `src/controllers/product.controller.js`**

```javascript
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, paginationResponse } = require('../utils/responseHandler');
const { NotFoundError, ValidationError } = require('../utils/customErrors');

/**
 * @desc    Get all products with pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Execute query
  const [products, totalItems] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('createdBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return paginationResponse(res, 200, 'Products retrieved successfully', {
    items: products,
    currentPage: page,
    totalPages,
    totalItems,
    limit
  });
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name')
    .populate('brand', 'name')
    .populate('warehouse', 'name location')
    .populate('createdBy', 'firstName lastName');

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return successResponse(res, 200, 'Product retrieved successfully', { product });
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Admin, Manager)
 */
const createProduct = asyncHandler(async (req, res) => {
  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku: req.body.sku });
  if (existingProduct) {
    throw new ValidationError('Product with this SKU already exists');
  }

  // Create product
  const product = await Product.create({
    ...req.body,
    createdBy: req.user._id
  });

  // Populate references
  await product.populate('category brand createdBy');

  return successResponse(res, 201, 'Product created successfully', { product });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Manager)
 */
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Check if updating SKU and it conflicts
  if (req.body.sku && req.body.sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      throw new ValidationError('Product with this SKU already exists');
    }
  }

  // Update product
  product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user._id
    },
    { new: true, runValidators: true }
  ).populate('category brand updatedBy');

  return successResponse(res, 200, 'Product updated successfully', { product });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await product.deleteOne();

  return successResponse(res, 200, 'Product deleted successfully', null);
});

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private (Admin, Manager, Staff)
 */
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (operation === 'add') {
    product.stock += quantity;
  } else if (operation === 'subtract') {
    if (product.stock < quantity) {
      throw new ValidationError('Insufficient stock');
    }
    product.stock -= quantity;
  }

  // Update status based on stock
  if (product.stock === 0) {
    product.status = 'out_of_stock';
  } else if (product.status === 'out_of_stock') {
    product.status = 'active';
  }

  product.updatedBy = req.user._id;
  await product.save();

  return successResponse(res, 200, 'Stock updated successfully', { product });
});

/**
 * @desc    Get low stock products
 * @route   GET /api/products/low-stock
 * @access  Private (Admin, Manager)
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$stock', '$minStock'] }
  })
    .populate('category', 'name')
    .sort({ stock: 1 });

  return successResponse(
    res,
    200,
    'Low stock products retrieved successfully',
    { products, count: products.length }
  );
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts
};
```

### Step 3: Create Product Routes

**File: `src/routes/product.routes.js`**

```javascript
const express = require('express');
const { body, param } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * Validation rules
 */
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const updateStockValidation = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('operation')
    .isIn(['add', 'subtract'])
    .withMessage('Operation must be either add or subtract')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid product ID')
];

/**
 * Routes
 */

// Public routes
router.get('/', getProducts);
router.get('/:id', idValidation, validate, getProduct);

// Protected routes
router.use(protect); // All routes below require authentication

// Admin and Manager only
router.post(
  '/',
  authorize('admin', 'manager'),
  createProductValidation,
  validate,
  createProduct
);

router.put(
  '/:id',
  authorize('admin', 'manager'),
  idValidation,
  updateProductValidation,
  validate,
  updateProduct
);

router.delete(
  '/:id',
  authorize('admin'),
  idValidation,
  validate,
  deleteProduct
);

// Stock management (Admin, Manager, Staff)
router.patch(
  '/:id/stock',
  authorize('admin', 'manager', 'staff'),
  idValidation,
  updateStockValidation,
  validate,
  updateStock
);

// Low stock (Admin, Manager)
router.get(
  '/reports/low-stock',
  authorize('admin', 'manager'),
  getLowStockProducts
);

module.exports = router;
```

### Step 4: Register Routes in Server

**File: `src/server.js`**

Add the product routes:

```javascript
// API Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes'); // Add this

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Add this
```

### Step 5: Test the New Module

```bash
# Get all products
curl http://localhost:3000/api/products

# Create a product (with auth token)
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "description": "Product description",
    "sku": "PROD-001",
    "category": "CATEGORY_ID",
    "price": 99.99,
    "stock": 100
  }'
```

## 📝 Module Checklist

When creating a new module, ensure you have:

- [ ] **Model** with proper schema, validations, and indexes
- [ ] **Controller** with CRUD operations and error handling
- [ ] **Routes** with validation and authorization
- [ ] **Middleware** (if needed) for module-specific logic
- [ ] **Tests** (unit and integration)
- [ ] **Documentation** in API docs
- [ ] **Populated references** for related data
- [ ] **Pagination** for list endpoints
- [ ] **Search/filter** capabilities
- [ ] **Proper error handling** using custom errors
- [ ] **Authorization** based on user roles
- [ ] **Input validation** using express-validator

## 🎯 Common Patterns

### Pagination Pattern
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const [items, totalItems] = await Promise.all([
  Model.find(filter).skip(skip).limit(limit),
  Model.countDocuments(filter)
]);

const totalPages = Math.ceil(totalItems / limit);
```

### Search Pattern
```javascript
const filter = {};
if (req.query.search) {
  filter.$or = [
    { name: { $regex: req.query.search, $options: 'i' } },
    { description: { $regex: req.query.search, $options: 'i' } }
  ];
}
```

### Soft Delete Pattern
```javascript
// Add to schema
deletedAt: {
  type: Date,
  default: null
}

// In controller
await model.updateOne({ _id: id }, { deletedAt: new Date() });

// Filter out deleted
const filter = { deletedAt: null };
```

## 🚀 Next Modules to Create

Using this template, create these modules:

1. **Category** - Product categories
2. **Brand** - Product brands
3. **Warehouse** - Warehouse management
4. **Order** - Order processing
5. **Customer** - Customer management
6. **Supplier** - Supplier management
7. **Invoice** - Invoice generation
8. **Payment** - Payment processing
9. **Report** - Analytics and reports
10. **Settings** - Application settings

Each module should follow this same structure for consistency and maintainability.
