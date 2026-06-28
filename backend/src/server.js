const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:4200,http://localhost:8100,http://localhost:8101'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Encrypt-Response'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request/Response encryption middleware
const { decryptRequest, encryptResponse } = require('./middleware/encryption');
app.use(decryptRequest);
app.use(encryptResponse);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Sindhu POS API', 
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Lightweight health check reachable behind the reverse proxy at /api/health
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// User Management Routes
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// Product Routes
const productRoutes = require('./modules/product/product.routes');
app.use('/api/products', productRoutes);

// Store Routes
const storeRoutes = require('./modules/store/store.routes');
app.use('/api/stores', storeRoutes);

// Warehouse Routes
const warehouseRoutes = require('./modules/warehouse/warehouse.routes');
app.use('/api/warehouses', warehouseRoutes);

// Category Routes
const categoryRoutes = require('./modules/category/category.routes');
app.use('/api/categories', categoryRoutes);

// Subcategory Routes
const subcategoryRoutes = require('./modules/subcategory/subcategory.routes');
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/sub-sub-categories', subcategoryRoutes);

// Brand Routes
const brandRoutes = require('./modules/brand/brand.routes');
app.use('/api/brands', brandRoutes);

// Unit Routes
const unitRoutes = require('./modules/unit/unit.routes');
app.use('/api/units', unitRoutes);

// Barcode Routes
const barcodeRoutes = require('./modules/barcode/barcode.routes');
app.use('/api/barcodes', barcodeRoutes);

// Banner Routes
const bannerRoutes = require('./modules/banner/banner.routes');
app.use('/api/banners', bannerRoutes);

// Wishlist Routes
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');
app.use('/api/wishlist', wishlistRoutes);

// Order Routes
const orderRoutes = require('./modules/order/order.routes');
app.use('/api/orders', orderRoutes);

// Vendor Routes
const vendorRoutes = require('./modules/vendor/vendor.routes');
app.use('/api/suppliers', vendorRoutes);

// B2B Routes
const b2bRoutes = require('./modules/b2b/b2b.routes');
app.use('/api/b2b', b2bRoutes);

// 404 Not Found Handler
const notFound = require('./middleware/notFound');
app.use(notFound);

// Global Error Handler (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
