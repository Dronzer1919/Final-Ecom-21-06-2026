const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const Product = require('./src/modules/product/product.model');
const Category = require('./src/modules/category/category.model');
const Brand = require('./src/modules/brand/brand.model');
const Warehouse = require('./src/modules/warehouse/warehouse.model');
const Store = require('./src/modules/store/store.model');
const Unit = require('./src/modules/unit/unit.model');
const SubCategory = require('./src/modules/subcategory/subcategory.model');
const Barcode = require('./src/modules/barcode/barcode.model');

async function addLowStockProducts() {
  try {
    console.log('\n🔍 Fetching categories, brands, warehouses, and stores...');
    
    // Get first available category, brand, warehouse, store, unit, subcategory, and barcode
    const category = await Category.findOne();
    const brand = await Brand.findOne();
    const warehouse = await Warehouse.findOne();
    const store = await Store.findOne();
    const unit = await Unit.findOne();
    const subCategory = await SubCategory.findOne();
    const barcode = await Barcode.findOne();

    if (!category || !brand || !warehouse || !store || !unit || !subCategory || !barcode) {
      console.error('❌ Missing required data. Please ensure you have at least one category, brand, warehouse, store, unit, subcategory, and barcode in the database.');
      process.exit(1);
    }

    console.log(`✅ Found: Category="${category.name}", Brand="${brand.name}", Warehouse="${warehouse.name}", Store="${store.name}", Unit="${unit.name}", SubCategory="${subCategory.name}", Barcode="${barcode.name}"`);

    // Low stock products to add
    const lowStockProducts = [
      {
        name: 'Gaming Mouse Low Stock',
        productName: 'Gaming Mouse Low Stock',
        description: 'High-precision gaming mouse with low stock',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 3,
        quantityAlert: 10,
        price: 59.99,
        cost: 35.00,
        itemCode: `LS-MOUSE-${Date.now()}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      },
      {
        name: 'Wireless Keyboard Low Stock',
        productName: 'Wireless Keyboard Low Stock',
        description: 'Ergonomic wireless keyboard running low',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 5,
        quantityAlert: 15,
        price: 79.99,
        cost: 45.00,
        itemCode: `LS-KEYB-${Date.now() + 1}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      },
      {
        name: 'USB-C Cable Low Stock',
        productName: 'USB-C Cable Low Stock',
        description: 'Fast charging USB-C cable with limited quantity',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 8,
        quantityAlert: 20,
        price: 19.99,
        cost: 8.00,
        itemCode: `LS-CABLE-${Date.now() + 2}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      },
      {
        name: 'Laptop Stand Low Stock',
        productName: 'Laptop Stand Low Stock',
        description: 'Adjustable aluminum laptop stand running low',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 2,
        quantityAlert: 12,
        price: 49.99,
        cost: 25.00,
        itemCode: `LS-STAND-${Date.now() + 3}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      },
      {
        name: 'Phone Case Low Stock',
        productName: 'Phone Case Low Stock',
        description: 'Premium protective phone case with low inventory',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 6,
        quantityAlert: 25,
        price: 29.99,
        cost: 12.00,
        itemCode: `LS-CASE-${Date.now() + 4}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      },
      {
        name: 'Out of Stock Headphones',
        productName: 'Out of Stock Headphones',
        description: 'Noise-cancelling headphones - currently out of stock',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 0,
        quantityAlert: 15,
        price: 149.99,
        cost: 80.00,
        itemCode: `OOS-HEAD-${Date.now() + 5}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      },
      {
        name: 'Out of Stock Monitor',
        productName: 'Out of Stock Monitor',
        description: '27-inch 4K monitor - out of stock',
        category: category._id,
        subCategory: subCategory._id,
        brand: brand._id,
        warehouse: warehouse._id,
        store: store._id,
        unit: unit._id,
        quantity: 0,
        quantityAlert: 10,
        price: 399.99,
        cost: 250.00,
        itemCode: `OOS-MON-${Date.now() + 6}`,
        barcodeSymbology: barcode._id,
        taxType: 'Exclusive',
        discountType: 'Percentage',
        isActive: true
      }
    ];

    console.log('\n📦 Adding low stock and out of stock products...');
    
    for (const productData of lowStockProducts) {
      const product = new Product(productData);
      await product.save();
      
      const status = productData.quantity === 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK';
      console.log(`${status}: ${productData.name} (Qty: ${productData.quantity}, Alert: ${productData.quantityAlert})`);
    }

    console.log('\n✅ Successfully added 5 low stock and 2 out of stock products!');
    console.log('\n📊 Summary:');
    console.log('   - Low Stock Products: 5 (quantity > 0 && quantity < quantityAlert)');
    console.log('   - Out of Stock Products: 2 (quantity === 0)');
    console.log('\nYou can now test the low-stocks page at http://localhost:4200/inventory/low-stocks');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding products:', error);
    process.exit(1);
  }
}

// Run the function
addLowStockProducts();
