const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Product = require('./src/modules/product/product.model');

async function addExpiredProducts() {
  try {
    console.log('Connected to database');
    
    // Find a few existing products to update with expired dates
    const products = await Product.find({ isDeleted: false }).limit(5);
    
    if (products.length === 0) {
      console.log('No products found in database. Please add some products first.');
      process.exit(1);
    }
    
    console.log(`Found ${products.length} products. Updating their expiry dates to be expired...`);
    
    // Set expiry dates to be in the past (before March 18, 2026)
    const expiredDates = [
      new Date('2025-12-20'),
      new Date('2025-11-15'),
      new Date('2026-01-10'),
      new Date('2026-02-05'),
      new Date('2026-03-01')
    ];
    
    for (let i = 0; i < Math.min(products.length, 5); i++) {
      products[i].expiryOn = expiredDates[i];
      products[i].manufacturedDate = new Date(expiredDates[i].getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year before expiry
      await products[i].save();
      console.log(`✓ Updated ${products[i].name} - Expiry: ${expiredDates[i].toISOString()}`);
    }
    
    console.log('\n✅ Successfully added expired products for testing!');
    console.log('You can now view them in the Expired Products page.');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

addExpiredProducts();
