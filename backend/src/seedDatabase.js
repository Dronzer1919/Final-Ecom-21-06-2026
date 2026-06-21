const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Brand = require('./modules/brand/brand.model');
const Category = require('./modules/category/category.model');
const Subcategory = require('./modules/subcategory/subcategory.model');
const Unit = require('./modules/unit/unit.model');
const Store = require('./modules/store/store.model');
const Warehouse = require('./modules/warehouse/warehouse.model');
const Barcode = require('./modules/barcode/barcode.model');
const Banner = require('./modules/banner/banner.model');
const Product = require('./modules/product/product.model');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Read JSON file
const readJSONFile = (filename) => {
  const filePath = path.join(__dirname, '../seed-data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await Unit.deleteMany({});
    await Store.deleteMany({});
    await Warehouse.deleteMany({});
    await Barcode.deleteMany({});
    await Banner.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Ensure proper indexes (drop and recreate if needed)
    console.log('🔧 Ensuring proper indexes...');
    try {
      await Product.collection.dropIndexes();
      console.log('✅ Dropped all product indexes');
    } catch (error) {
      // Indexes might not exist, continue
    }
    await Product.createIndexes();
    console.log('✅ Product indexes recreated\n');

    // Step 1: Seed Brands
    console.log('📦 Seeding brands...');
    const brandsData = readJSONFile('brands.json');
    const brands = await Brand.insertMany(brandsData);
    console.log(`✅ ${brands.length} brands seeded\n`);

    // Step 2: Seed Categories
    console.log('📦 Seeding categories...');
    const categoriesData = readJSONFile('categories.json');
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ ${categories.length} categories seeded\n`);

    // Step 3: Seed Subcategories
    console.log('📦 Seeding subcategories...');
    const subcategoriesData = readJSONFile('subcategories.json');
    // Map category names to ObjectIds
    const subcategoriesWithRefs = subcategoriesData.map(sub => {
      const category = categories.find(cat => cat.name === sub.categoryName);
      return {
        ...sub,
        category: category ? category._id : null
      };
    });
    const subcategories = await Subcategory.insertMany(subcategoriesWithRefs);
    console.log(`✅ ${subcategories.length} subcategories seeded\n`);

    // Step 4: Seed Units
    console.log('📦 Seeding units...');
    const unitsData = readJSONFile('units.json');
    const units = await Unit.insertMany(unitsData);
    console.log(`✅ ${units.length} units seeded\n`);

    // Step 5: Seed Stores
    console.log('📦 Seeding stores...');
    const storesData = readJSONFile('stores.json');
    const stores = await Store.insertMany(storesData);
    console.log(`✅ ${stores.length} stores seeded\n`);

    // Step 6: Seed Warehouses
    console.log('📦 Seeding warehouses...');
    const warehousesData = readJSONFile('warehouses.json');
    const warehouses = await Warehouse.insertMany(warehousesData);
    console.log(`✅ ${warehouses.length} warehouses seeded\n`);

    // Step 7: Create Barcode Symbologies
    console.log('📦 Creating barcode symbologies...');
    const barcodeSymbologies = [
      { name: 'CODE128', code: 'CODE128', description: 'Code 128 - High-density linear barcode' },
      { name: 'EAN13', code: 'EAN13', description: 'EAN-13 - International Article Number' },
      { name: 'UPC', code: 'UPC', description: 'UPC - Universal Product Code' },
      { name: 'QR', code: 'QR', description: 'QR Code - Two-dimensional barcode' }
    ];
    const barcodes = await Barcode.insertMany(barcodeSymbologies);
    console.log(`✅ ${barcodes.length} barcode symbologies created\n`);

    // Step 8: Seed Banners
    console.log('🎨 Seeding banners...');
    const bannersData = readJSONFile('banners.json');
    const banners = await Banner.insertMany(bannersData);
    console.log(`✅ ${banners.length} banners seeded\n`);

    // Step 9: Seed Products with proper references
    console.log('📦 Seeding products...');
    const productsData = readJSONFile('products.json');
    
    // Get default references (first of each type)
    const defaultStore = stores[0];
    const defaultWarehouse = warehouses[0];
    const defaultUnit = units.find(u => u.shortName === 'pc') || units[0];
    
    // Helper function to generate slug
    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    
    // Map products with proper ObjectId references
    const productsWithRefs = productsData.map((product, index) => {
      // Determine category based on product name/type
      let category, subcategory, brand;
      
      // Electronics products
      if (product.name.includes('iPhone') || product.name.includes('MacBook') || 
          product.name.includes('iPad') || product.name.includes('AirPods') || product.name.includes('Apple')) {
        brand = brands.find(b => b.name === 'Apple');
        category = categories.find(c => c.name === 'Electronics');
        if (product.name.includes('iPhone') || product.name.includes('Galaxy') || product.name.includes('OnePlus')) {
          subcategory = subcategories.find(s => s.name === 'Smartphones');
        } else if (product.name.includes('MacBook')) {
          subcategory = subcategories.find(s => s.name === 'Laptops');
        } else if (product.name.includes('iPad')) {
          subcategory = subcategories.find(s => s.name === 'Tablets');
        } else if (product.name.includes('AirPods')) {
          subcategory = subcategories.find(s => s.name === 'Wireless Earbuds');
        }
      } else if (product.name.includes('Samsung')) {
        brand = brands.find(b => b.name === 'Samsung');
        category = categories.find(c => c.name === 'Electronics');
        if (product.name.includes('Galaxy S') || product.name.includes('Galaxy Note')) {
          subcategory = subcategories.find(s => s.name === 'Smartphones');
        } else if (product.name.includes('TV')) {
          subcategory = subcategories.find(s => s.name === 'Televisions');
        } else if (product.name.includes('Watch')) {
          subcategory = subcategories.find(s => s.name === 'Smartwatches');
        }
      } else if (product.name.includes('OnePlus')) {
        brand = brands.find(b => b.name === 'OnePlus');
        category = categories.find(c => c.name === 'Electronics');
        subcategory = subcategories.find(s => s.name === 'Smartphones');
      } else if (product.name.includes('Sony')) {
        brand = brands.find(b => b.name === 'Sony');
        category = categories.find(c => c.name === 'Electronics');
        if (product.name.includes('PlayStation')) {
          subcategory = subcategories.find(s => s.name === 'Gaming Consoles');
        } else if (product.name.includes('Headphones')) {
          subcategory = subcategories.find(s => s.name === 'Headphones');
        }
      } else if (product.name.includes('Canon')) {
        brand = brands.find(b => b.name === 'Canon');
        category = categories.find(c => c.name === 'Electronics');
        subcategory = subcategories.find(s => s.name === 'Cameras');
      } else if (product.name.includes('Nike')) {
        brand = brands.find(b => b.name === 'Nike');
        category = categories.find(c => c.name === 'Fashion');
        subcategory = subcategories.find(s => s.name === 'Footwear');
      } else if (product.name.includes('Logitech')) {
        brand = brands.find(b => b.name === 'Logitech');
        category = categories.find(c => c.name === 'Electronics');
        subcategory = subcategories.find(s => s.name === 'Computer Accessories');
      } else if (product.name.includes('Dyson')) {
        brand = brands.find(b => b.name === 'Dyson');
        category = categories.find(c => c.name === 'Home & Living');
        subcategory = subcategories.find(s => s.name === 'Home Appliances');
      }
      
      // Fallback to first available if not found
      if (!category) category = categories[0];
      if (!subcategory) subcategory = subcategories[0];
      if (!brand) brand = brands[0];
      
      // Find barcode symbology
      const barcodeSymbology = barcodes.find(b => b.name === product.barcodeSymbology) || barcodes[0];
      
      // Generate slug if not provided
      const slug = product.slug || generateSlug(product.name);
      
      return {
        ...product,
        slug,
        store: defaultStore._id,
        warehouse: defaultWarehouse._id,
        category: category._id,
        subCategory: subcategory._id,
        brand: brand._id,
        unit: defaultUnit._id,
        barcodeSymbology: barcodeSymbology._id,
        status: product.isActive ? 'Active' : 'Inactive'
      };
    });
    
    const products = await Product.insertMany(productsWithRefs);
    console.log(`✅ ${products.length} products seeded\n`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Brands: ${brands.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Subcategories: ${subcategories.length}`);
    console.log(`   - Units: ${units.length}`);
    console.log(`   - Stores: ${stores.length}`);
    console.log(`   - Warehouses: ${warehouses.length}`);
    console.log(`   - Barcode Symbologies: ${barcodes.length}`);
    console.log(`   - Products: ${products.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder
const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

run();
