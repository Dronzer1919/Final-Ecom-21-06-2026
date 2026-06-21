/**
 * Seed script: populate all B2B data into MongoDB
 * Run from project root: node seed-b2b-data.js
 */
const path = require('path');
const backendDir = path.resolve(__dirname, 'backend');
// dotenv and mongoose live in backend/node_modules — require by absolute path
require(path.join(backendDir, 'node_modules/dotenv')).config({ path: path.join(backendDir, '.env') });
const mongoose = require(path.join(backendDir, 'node_modules/mongoose'));
// Pre-load models
const modelPath = './backend/src/modules/b2b/b2b.model';
const { B2BSection, B2BCategory, B2BCatalogProduct, B2BMarketplaceProduct } = require(modelPath);

// ─── Connect ─────────────────────────────────────────────────────────────────
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sindhu-pos';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}

// ─── Data ────────────────────────────────────────────────────────────────────

const sections = [
  {
    sectionId: 'grocery',
    name: 'Grocery',
    icon: '🛒',
    description: 'Staples, packaged foods, dairy, and more',
    categoryIds: ['grocery-staples', 'packaged-foods', 'dairy-frozen', 'soap-hygiene']
  },
  {
    sectionId: 'home-care',
    name: 'Home & Personal Care',
    icon: '🏠',
    description: 'Cleaning, laundry, and personal care products',
    categoryIds: ['home-personal-care']
  }
];

const categories = [
  {
    categoryId: 'grocery-staples',
    name: 'Grocery & Staples',
    description: 'Grains, rice, dals, spices, oil, sugar and flour',
    icon: '🌾',
    sectionId: 'grocery',
    subcategories: [
      { subcategoryId: 'rice',        name: 'Rice',            icon: '🍚', categoryId: 'grocery-staples', productIds: ['P001', 'P001B', 'P001C'] },
      { subcategoryId: 'dal-pulses',  name: 'Dal & Pulses',    icon: '🫘', categoryId: 'grocery-staples', productIds: ['P002', 'P008'] },
      { subcategoryId: 'cooking-oil', name: 'Cooking Oil',     icon: '🫙', categoryId: 'grocery-staples', productIds: ['P003'] },
      { subcategoryId: 'flour-atta',  name: 'Flour & Atta',    icon: '🌿', categoryId: 'grocery-staples', productIds: ['P004'] },
      { subcategoryId: 'sugar-salt',  name: 'Sugar & Salt',    icon: '🍬', categoryId: 'grocery-staples', productIds: ['P005'] },
      { subcategoryId: 'spices',      name: 'Spices & Masala', icon: '🌶️', categoryId: 'grocery-staples', productIds: ['P006', 'P007'] }
    ]
  },
  {
    categoryId: 'packaged-foods',
    name: 'Packaged Foods',
    description: 'Snacks, biscuits, instant foods, and cereals',
    icon: '🍪',
    sectionId: 'grocery',
    subcategories: [
      { subcategoryId: 'chips-snacks',    name: 'Chips & Snacks',      icon: '🥨', categoryId: 'packaged-foods', productIds: ['P013'] },
      { subcategoryId: 'biscuits',        name: 'Biscuits & Cookies',  icon: '🍘', categoryId: 'packaged-foods', productIds: ['P014'] },
      { subcategoryId: 'instant-noodles', name: 'Instant Noodles',     icon: '🍜', categoryId: 'packaged-foods', productIds: ['P015'] },
      { subcategoryId: 'chocolates',      name: 'Chocolates',          icon: '🍫', categoryId: 'packaged-foods', productIds: ['P016'] },
      { subcategoryId: 'cereals',         name: 'Breakfast Cereals',   icon: '🌽', categoryId: 'packaged-foods', productIds: ['P017'] },
      { subcategoryId: 'namkeen',         name: 'Namkeen & Mixtures',  icon: '🧆', categoryId: 'packaged-foods', productIds: ['P018'] }
    ]
  },
  {
    categoryId: 'dairy-frozen',
    name: 'Dairy & Frozen',
    description: 'Milk, butter, ghee, and frozen vegetables',
    icon: '🥛',
    sectionId: 'grocery',
    subcategories: [
      { subcategoryId: 'milk-products',     name: 'Milk Products',       icon: '🥛', categoryId: 'dairy-frozen', productIds: ['P009'] },
      { subcategoryId: 'ghee-butter',       name: 'Ghee & Butter',       icon: '🧈', categoryId: 'dairy-frozen', productIds: ['P010'] },
      { subcategoryId: 'frozen-vegetables', name: 'Frozen Vegetables',   icon: '🥦', categoryId: 'dairy-frozen', productIds: ['P011'] },
      { subcategoryId: 'paneer',            name: 'Paneer & Cheese',     icon: '🧀', categoryId: 'dairy-frozen', productIds: ['P012'] }
    ]
  },
  {
    categoryId: 'soap-hygiene',
    name: 'Soap & Personal Hygiene',
    description: 'Bar soaps, liquid handwash, shampoos, and hygiene products',
    icon: '🧼',
    sectionId: 'grocery',
    subcategories: [
      { subcategoryId: 'bar-soap',        name: 'Bar Soap',             icon: '🧼', categoryId: 'soap-hygiene', productIds: ['P022'] },
      { subcategoryId: 'liquid-handwash', name: 'Liquid Handwash',      icon: '🫧', categoryId: 'soap-hygiene', productIds: ['P023'] },
      { subcategoryId: 'shampoo',         name: 'Shampoo & Hair Care',  icon: '🪥', categoryId: 'soap-hygiene', productIds: ['P024'] }
    ]
  },
  {
    categoryId: 'home-personal-care',
    name: 'Home & Personal Care',
    description: 'Detergents, cleaners, toiletries, and beauty products',
    icon: '🧴',
    sectionId: 'home-care',
    subcategories: [
      { subcategoryId: 'detergent',    name: 'Detergent & Washing', icon: '🫧', categoryId: 'home-personal-care', productIds: ['P019'] },
      { subcategoryId: 'cleaning',     name: 'Cleaning Products',   icon: '🧹', categoryId: 'home-personal-care', productIds: ['P020'] },
      { subcategoryId: 'personal-care',name: 'Personal Care',       icon: '💊', categoryId: 'home-personal-care', productIds: ['P021'] }
    ]
  }
];

const catalogProducts = [
  { productId: 'P001',  productName: 'Basmati Rice 1121',         category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'rice',           image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 75, max: 115 }, unit: 'Kg' },
  { productId: 'P001B', productName: 'Basmati Rice 1509',         category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'rice',           image: 'https://images.unsplash.com/photo-1617224908579-44e5b4ce0fbb?w=400&h=400&fit=crop', vendorCount: 3, priceRange: { min: 80, max: 110 }, unit: 'Kg' },
  { productId: 'P001C', productName: 'Pusa Rice (Sona Masoori)',  category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'rice',           image: 'https://images.unsplash.com/photo-1569997768369-5e46ffd20d12?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 55, max:  90 }, unit: 'Kg' },
  { productId: 'P002',  productName: 'Toor Dal (Arhar)',          category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'dal-pulses',     image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc', vendorCount: 4, priceRange: { min:  92, max: 120 }, unit: 'Kg' },
  { productId: 'P003',  productName: 'Sunflower Oil',             category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'cooking-oil',    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 140, max: 165 }, unit: 'L'  },
  { productId: 'P004',  productName: 'Whole Wheat Atta',          category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'flour-atta',     image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min:  28, max:  38 }, unit: 'Kg' },
  { productId: 'P005',  productName: 'Premium Sugar',             category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'sugar-salt',     image: 'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg', vendorCount: 4, priceRange: { min: 38, max: 45 }, unit: 'Kg' },
  { productId: 'P006',  productName: 'Turmeric Powder',           category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'spices',         image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 180, max: 250 }, unit: 'Kg' },
  { productId: 'P007',  productName: 'Red Chilli Powder',         category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'spices',         image: 'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 220, max: 280 }, unit: 'Kg' },
  { productId: 'P008',  productName: 'Moong Dal',                 category: 'Grocery & Staples',   categoryId: 'grocery-staples',    subcategoryId: 'dal-pulses',     image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min:  95, max: 125 }, unit: 'Kg' },
  { productId: 'P009',  productName: 'Full Cream Milk Powder',    category: 'Dairy & Frozen',      categoryId: 'dairy-frozen',       subcategoryId: 'milk-products',  image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 320, max: 380 }, unit: 'Kg' },
  { productId: 'P010',  productName: 'Pure Desi Ghee',            category: 'Dairy & Frozen',      categoryId: 'dairy-frozen',       subcategoryId: 'ghee-butter',    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 450, max: 550 }, unit: 'Kg' },
  { productId: 'P011',  productName: 'Frozen Mixed Vegetables',   category: 'Dairy & Frozen',      categoryId: 'dairy-frozen',       subcategoryId: 'frozen-vegetables', image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 55, max: 75 }, unit: 'Kg' },
  { productId: 'P012',  productName: 'Paneer (Cottage Cheese)',   category: 'Dairy & Frozen',      categoryId: 'dairy-frozen',       subcategoryId: 'paneer',         image: 'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019', vendorCount: 4, priceRange: { min: 280, max: 340 }, unit: 'Kg' },
  { productId: 'P013',  productName: 'Potato Chips (Party Pack)', category: 'Packaged Foods',      categoryId: 'packaged-foods',     subcategoryId: 'chips-snacks',   image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 180, max: 220 }, unit: 'Kg' },
  { productId: 'P014',  productName: 'Cream Biscuits',            category: 'Packaged Foods',      categoryId: 'packaged-foods',     subcategoryId: 'biscuits',       image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 120, max: 160 }, unit: 'Kg' },
  { productId: 'P015',  productName: 'Instant Noodles (Bulk)',    category: 'Packaged Foods',      categoryId: 'packaged-foods',     subcategoryId: 'instant-noodles',image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 240, max: 280 }, unit: 'Kg' },
  { productId: 'P016',  productName: 'Dark Chocolate Bars',       category: 'Packaged Foods',      categoryId: 'packaged-foods',     subcategoryId: 'chocolates',     image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 450, max: 550 }, unit: 'Kg' },
  { productId: 'P017',  productName: 'Cornflakes',                category: 'Packaged Foods',      categoryId: 'packaged-foods',     subcategoryId: 'cereals',        image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 220, max: 280 }, unit: 'Kg' },
  { productId: 'P018',  productName: 'Masala Namkeen',            category: 'Packaged Foods',      categoryId: 'packaged-foods',     subcategoryId: 'namkeen',        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min: 180, max: 230 }, unit: 'Kg' },
  { productId: 'P019',  productName: 'Detergent Powder (Bulk)',   category: 'Home & Personal Care',categoryId: 'home-personal-care', subcategoryId: 'detergent',      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min:  85, max: 115 }, unit: 'Kg' },
  { productId: 'P020',  productName: 'Floor Cleaner (Bulk)',      category: 'Home & Personal Care',categoryId: 'home-personal-care', subcategoryId: 'cleaning',       image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min:  65, max:  95 }, unit: 'L'  },
  { productId: 'P021',  productName: 'Toothpaste (Pack of 12)',   category: 'Home & Personal Care',categoryId: 'home-personal-care', subcategoryId: 'personal-care',  image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min:  95, max: 135 }, unit: 'Pack'},
  { productId: 'P022',  productName: 'Bath Soap Bar (Bulk)',       category: 'Soap & Personal Hygiene',categoryId: 'soap-hygiene',  subcategoryId: 'bar-soap',       image: 'https://images.unsplash.com/photo-1583947582774-eb09a0bc0b7e?w=400&h=400&fit=crop', vendorCount: 3, priceRange: { min:  35, max:  55 }, unit: 'Piece'},
  { productId: 'P023',  productName: 'Liquid Handwash (Bulk)',    category: 'Soap & Personal Hygiene',categoryId: 'soap-hygiene',  subcategoryId: 'liquid-handwash',image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', vendorCount: 4, priceRange: { min:  80, max: 120 }, unit: 'L'  },
  { productId: 'P024',  productName: 'Shampoo (Bulk 5L)',         category: 'Soap & Personal Hygiene',categoryId: 'soap-hygiene',  subcategoryId: 'shampoo',        image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop', vendorCount: 3, priceRange: { min: 350, max: 500 }, unit: 'L'  }
];

const marketplaceProducts = [
  // ── P001 Basmati Rice 1121 ────────────────────────────────────────────────
  { productId:'P001', productName:'Basmati Rice 1121', category:'Grocery & Staples', variety:'1121', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', supplier:{ supplierId:'S001', supplierName:'Amam Enterprises', rating:4.0, reviewCount:6, price:88, unit:'Kg', location:'Pune - Market Yard', responseRate:71, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs', bulkPricing:[{quantity:5,unit:'Kg',price:87,discount:1},{quantity:10,unit:'Kg',price:86,discount:2},{quantity:25,unit:'Kg',price:84,discount:5},{quantity:50,unit:'Kg',price:82,discount:7},{quantity:100,unit:'Kg',price:79,discount:10},{quantity:250,unit:'Kg',price:75,discount:15}] } },
  { productId:'P001', productName:'Basmati Rice 1121', category:'Grocery & Staples', variety:'1121', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', supplier:{ supplierId:'S002', supplierName:'Vinsark Foods Private Limited', rating:3.5, reviewCount:17, price:95, unit:'Kg', location:'Mumbai', responseRate:85, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'5 yrs', bulkPricing:[{quantity:5,unit:'Kg',price:93,discount:2},{quantity:10,unit:'Kg',price:92,discount:3},{quantity:25,unit:'Kg',price:90,discount:5},{quantity:50,unit:'Kg',price:88,discount:7},{quantity:100,unit:'Kg',price:85,discount:11},{quantity:200,unit:'Kg',price:81,discount:15}] } },
  { productId:'P001', productName:'Basmati Rice 1121', category:'Grocery & Staples', variety:'1121', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', supplier:{ supplierId:'S003', supplierName:'Pannalal Bansilal', rating:4.7, reviewCount:33, price:115, unit:'Kg', location:'Pune - Market Yard', responseRate:95, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'8 yrs', bulkPricing:[{quantity:5,unit:'Kg',price:110,discount:4},{quantity:10,unit:'Kg',price:112,discount:3},{quantity:20,unit:'Kg',price:109,discount:5},{quantity:50,unit:'Kg',price:106,discount:8},{quantity:100,unit:'Kg',price:103,discount:10},{quantity:200,unit:'Kg',price:98,discount:15}] } },
  { productId:'P001', productName:'Basmati Rice 1121', category:'Grocery & Staples', variety:'1121', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', supplier:{ supplierId:'S004', supplierName:'Green Valley Trading', rating:4.2, reviewCount:28, price:75, unit:'Kg', location:'Thane', responseRate:78, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'3 yrs', bulkPricing:[{quantity:10,unit:'Kg',price:73,discount:3},{quantity:25,unit:'Kg',price:72,discount:4},{quantity:50,unit:'Kg',price:70,discount:7},{quantity:100,unit:'Kg',price:68,discount:9},{quantity:250,unit:'Kg',price:65,discount:13},{quantity:500,unit:'Kg',price:62,discount:17}] } },

  // ── P002 Toor Dal ─────────────────────────────────────────────────────────
  { productId:'P002', productName:'Toor Dal (Arhar)', category:'Grocery & Staples', variety:'Traditional', image:'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc', supplier:{ supplierId:'S005', supplierName:'Dal Traders Mumbai', rating:4.5, reviewCount:52, price:95, unit:'Kg', location:'Mumbai', responseRate:88, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'12 yrs', bulkPricing:[{quantity:10,unit:'Kg',price:93,discount:2},{quantity:15,unit:'Kg',price:92,discount:3},{quantity:50,unit:'Kg',price:88,discount:7},{quantity:75,unit:'Kg',price:86,discount:9},{quantity:150,unit:'Kg',price:81,discount:15},{quantity:300,unit:'Kg',price:76,discount:20}] } },
  { productId:'P002', productName:'Toor Dal (Arhar)', category:'Grocery & Staples', variety:'Traditional', image:'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc', supplier:{ supplierId:'S006', supplierName:'Pulse Merchants', rating:4.3, reviewCount:41, price:92, unit:'Kg', location:'Pune', responseRate:82, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'7 yrs', bulkPricing:[{quantity:10,unit:'Kg',price:90,discount:2},{quantity:20,unit:'Kg',price:89,discount:3},{quantity:40,unit:'Kg',price:87,discount:5},{quantity:50,unit:'Kg',price:85,discount:8},{quantity:200,unit:'Kg',price:79,discount:14},{quantity:400,unit:'Kg',price:74,discount:20}] } },
  { productId:'P002', productName:'Toor Dal (Arhar)', category:'Grocery & Staples', variety:'Traditional', image:'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc', supplier:{ supplierId:'S007', supplierName:'Quality Dal Ltd', rating:4.6, reviewCount:67, price:120, unit:'Kg', location:'Bengaluru', responseRate:91, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs', bulkPricing:[{quantity:15,unit:'Kg',price:117,discount:3},{quantity:30,unit:'Kg',price:115,discount:4},{quantity:60,unit:'Kg',price:112,discount:7},{quantity:100,unit:'Kg',price:108,discount:10},{quantity:300,unit:'Kg',price:102,discount:15},{quantity:500,unit:'Kg',price:96,discount:20}] } },
  { productId:'P002', productName:'Toor Dal (Arhar)', category:'Grocery & Staples', variety:'Traditional', image:'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS2EfRq38foBguZRayM-cGi1yimBOCFR4SRjpckfNabJsM8uqZr3tqUG3ayJxu_xVHTRfHhP357PmJZ9EgTH8j0LjeDXOIq6E0SeA_EPT-CiuB0S0pOE_r6fyc', supplier:{ supplierId:'S008', supplierName:'Shri Krishna Pulses', rating:4.1, reviewCount:29, price:98, unit:'Kg', location:'Hyderabad', responseRate:75, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'5 yrs', bulkPricing:[{quantity:10,unit:'Kg',price:96,discount:2},{quantity:25,unit:'Kg',price:94,discount:4},{quantity:50,unit:'Kg',price:91,discount:7},{quantity:75,unit:'Kg',price:88,discount:10},{quantity:150,unit:'Kg',price:84,discount:14},{quantity:300,unit:'Kg',price:79,discount:19}] } },

  // ── P003 Sunflower Oil ────────────────────────────────────────────────────
  { productId:'P003', productName:'Sunflower Oil', category:'Grocery & Staples', variety:'Refined', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', supplier:{ supplierId:'S009', supplierName:'Oil Corporation Ltd', rating:4.4, reviewCount:88, price:145, unit:'L', location:'Mumbai', responseRate:86, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs' } },
  { productId:'P003', productName:'Sunflower Oil', category:'Grocery & Staples', variety:'Refined', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', supplier:{ supplierId:'S010', supplierName:'Golden Oil Traders', rating:4.7, reviewCount:120, price:142, unit:'L', location:'Pune', responseRate:93, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'18 yrs' } },
  { productId:'P003', productName:'Sunflower Oil', category:'Grocery & Staples', variety:'Refined', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', supplier:{ supplierId:'S011', supplierName:'Pure Oils India', rating:4.2, reviewCount:45, price:165, unit:'L', location:'Bengaluru', responseRate:79, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'6 yrs' } },
  { productId:'P003', productName:'Sunflower Oil', category:'Grocery & Staples', variety:'Refined', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop', supplier:{ supplierId:'S012', supplierName:'Sunrise Edibles', rating:4.0, reviewCount:33, price:140, unit:'L', location:'Chennai', responseRate:74, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'4 yrs' } },

  // ── P004 Wheat Atta ───────────────────────────────────────────────────────
  { productId:'P004', productName:'Wheat Atta (Whole Wheat Flour)', category:'Grocery & Staples', variety:'Traditional', image:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', supplier:{ supplierId:'S013', supplierName:'Grain Masters', rating:4.5, reviewCount:78, price:38, unit:'Kg', location:'Pune', responseRate:87, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'11 yrs' } },
  { productId:'P004', productName:'Wheat Atta (Whole Wheat Flour)', category:'Grocery & Staples', variety:'Traditional', image:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', supplier:{ supplierId:'S014', supplierName:'Atta Mills India', rating:4.2, reviewCount:55, price:32, unit:'Kg', location:'Mumbai', responseRate:81, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'8 yrs' } },
  { productId:'P004', productName:'Wheat Atta (Whole Wheat Flour)', category:'Grocery & Staples', variety:'Traditional', image:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', supplier:{ supplierId:'S015', supplierName:'Fresh Flour Pvt Ltd', rating:4.7, reviewCount:142, price:40, unit:'Kg', location:'Hyderabad', responseRate:94, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'20 yrs' } },
  { productId:'P004', productName:'Wheat Atta (Whole Wheat Flour)', category:'Grocery & Staples', variety:'Traditional', image:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', supplier:{ supplierId:'S016', supplierName:'Organic Atta Suppliers', rating:3.9, reviewCount:31, price:35, unit:'Kg', location:'Bengaluru', responseRate:70, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'5 yrs' } },

  // ── P005 Sugar ────────────────────────────────────────────────────────────
  { productId:'P005', productName:'Sugar (White Refined)', category:'Grocery & Staples', variety:'Refined', image:'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg', supplier:{ supplierId:'S017', supplierName:'Sweet Suppliers', rating:4.3, reviewCount:92, price:42, unit:'Kg', location:'Mumbai', responseRate:84, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'14 yrs' } },
  { productId:'P005', productName:'Sugar (White Refined)', category:'Grocery & Staples', variety:'Refined', image:'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg', supplier:{ supplierId:'S018', supplierName:'Sugar Mills Corp', rating:4.6, reviewCount:108, price:40, unit:'Kg', location:'Pune', responseRate:90, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'16 yrs' } },
  { productId:'P005', productName:'Sugar (White Refined)', category:'Grocery & Staples', variety:'Refined', image:'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg', supplier:{ supplierId:'S019', supplierName:'Premium Sugar Ltd', rating:4.1, reviewCount:47, price:50, unit:'Kg', location:'Chennai', responseRate:76, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'7 yrs' } },
  { productId:'P005', productName:'Sugar (White Refined)', category:'Grocery & Staples', variety:'Refined', image:'https://www.tasteofhome.com/wp-content/uploads/2019/11/sugar-shutterstock_615908132.jpg', supplier:{ supplierId:'S020', supplierName:'Quality Sugar Traders', rating:3.8, reviewCount:29, price:38, unit:'Kg', location:'Thane', responseRate:68, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'4 yrs' } },

  // ── P006 Turmeric ─────────────────────────────────────────────────────────
  { productId:'P006', productName:'Turmeric Powder', category:'Grocery & Staples', variety:'Organic', image:'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop', supplier:{ supplierId:'S021', supplierName:'Spice Traders', rating:4.4, reviewCount:85, price:200, unit:'Kg', location:'Bengaluru', responseRate:85, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'12 yrs' } },
  { productId:'P006', productName:'Turmeric Powder', category:'Grocery & Staples', variety:'Organic', image:'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop', supplier:{ supplierId:'S022', supplierName:'Golden Spices', rating:4.7, reviewCount:134, price:250, unit:'Kg', location:'Mumbai', responseRate:93, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'18 yrs' } },
  { productId:'P006', productName:'Turmeric Powder', category:'Grocery & Staples', variety:'Organic', image:'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop', supplier:{ supplierId:'S023', supplierName:'Organic Turmeric Co', rating:4.2, reviewCount:56, price:230, unit:'Kg', location:'Hyderabad', responseRate:79, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },
  { productId:'P006', productName:'Turmeric Powder', category:'Grocery & Staples', variety:'Organic', image:'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop', supplier:{ supplierId:'S024', supplierName:'Haldi Merchants', rating:4.0, reviewCount:38, price:180, unit:'Kg', location:'Pune', responseRate:72, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'6 yrs' } },

  // ── P007 Red Chilli ───────────────────────────────────────────────────────
  { productId:'P007', productName:'Red Chilli Powder', category:'Grocery & Staples', variety:'Extra Hot', image:'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop', supplier:{ supplierId:'S025', supplierName:'Chilli Express', rating:4.5, reviewCount:97, price:240, unit:'Kg', location:'Mumbai', responseRate:88, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P007', productName:'Red Chilli Powder', category:'Grocery & Staples', variety:'Extra Hot', image:'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop', supplier:{ supplierId:'S026', supplierName:'Hot Spices Ltd', rating:4.3, reviewCount:72, price:260, unit:'Kg', location:'Pune', responseRate:82, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'11 yrs' } },
  { productId:'P007', productName:'Red Chilli Powder', category:'Grocery & Staples', variety:'Extra Hot', image:'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop', supplier:{ supplierId:'S027', supplierName:'Mirchi Masala Corp', rating:4.6, reviewCount:118, price:280, unit:'Kg', location:'Hyderabad', responseRate:91, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'17 yrs' } },
  { productId:'P007', productName:'Red Chilli Powder', category:'Grocery & Staples', variety:'Extra Hot', image:'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=400&h=400&fit=crop', supplier:{ supplierId:'S028', supplierName:'Fiery Foods', rating:4.1, reviewCount:43, price:220, unit:'Kg', location:'Bengaluru', responseRate:75, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'7 yrs' } },

  // ── P008 Moong Dal ────────────────────────────────────────────────────────
  { productId:'P008', productName:'Moong Dal (Green Gram)', category:'Grocery & Staples', variety:'Split', image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', supplier:{ supplierId:'S029', supplierName:'Green Dal Suppliers', rating:4.4, reviewCount:66, price:105, unit:'Kg', location:'Mumbai', responseRate:83, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs' } },
  { productId:'P008', productName:'Moong Dal (Green Gram)', category:'Grocery & Staples', variety:'Split', image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', supplier:{ supplierId:'S030', supplierName:'Pulse Paradise', rating:4.6, reviewCount:101, price:120, unit:'Kg', location:'Pune', responseRate:90, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'14 yrs' } },
  { productId:'P008', productName:'Moong Dal (Green Gram)', category:'Grocery & Staples', variety:'Split', image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', supplier:{ supplierId:'S031', supplierName:'Organic Moong Ltd', rating:4.2, reviewCount:49, price:125, unit:'Kg', location:'Bengaluru', responseRate:77, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'8 yrs' } },
  { productId:'P008', productName:'Moong Dal (Green Gram)', category:'Grocery & Staples', variety:'Split', image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', supplier:{ supplierId:'S032', supplierName:'Dal Bazaar', rating:3.9, reviewCount:34, price:95, unit:'Kg', location:'Chennai', responseRate:69, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'5 yrs' } },

  // ── P009 Milk Powder ──────────────────────────────────────────────────────
  { productId:'P009', productName:'Full Cream Milk Powder', category:'Dairy & Frozen', variety:'Premium', image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', supplier:{ supplierId:'S033', supplierName:'Dairy Fresh Ltd', rating:4.7, reviewCount:145, price:350, unit:'Kg', location:'Mumbai', responseRate:94, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'20 yrs' } },
  { productId:'P009', productName:'Full Cream Milk Powder', category:'Dairy & Frozen', variety:'Premium', image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', supplier:{ supplierId:'S034', supplierName:'Milk Masters', rating:4.5, reviewCount:112, price:320, unit:'Kg', location:'Pune', responseRate:87, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P009', productName:'Full Cream Milk Powder', category:'Dairy & Frozen', variety:'Premium', image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', supplier:{ supplierId:'S035', supplierName:'Creamy Delights', rating:4.3, reviewCount:78, price:380, unit:'Kg', location:'Bengaluru', responseRate:81, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'12 yrs' } },
  { productId:'P009', productName:'Full Cream Milk Powder', category:'Dairy & Frozen', variety:'Premium', image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop', supplier:{ supplierId:'S036', supplierName:'Dairy Valley', rating:4.1, reviewCount:54, price:340, unit:'Kg', location:'Hyderabad', responseRate:74, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },

  // ── P010 Desi Ghee ────────────────────────────────────────────────────────
  { productId:'P010', productName:'Pure Desi Ghee', category:'Dairy & Frozen', variety:'Traditional', image:'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop', supplier:{ supplierId:'S037', supplierName:'Ghee Grih', rating:4.8, reviewCount:178, price:520, unit:'Kg', location:'Mumbai', responseRate:96, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'25 yrs' } },
  { productId:'P010', productName:'Pure Desi Ghee', category:'Dairy & Frozen', variety:'Traditional', image:'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop', supplier:{ supplierId:'S038', supplierName:'Golden Ghee Ltd', rating:4.6, reviewCount:139, price:480, unit:'Kg', location:'Pune', responseRate:91, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'18 yrs' } },
  { productId:'P010', productName:'Pure Desi Ghee', category:'Dairy & Frozen', variety:'Traditional', image:'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop', supplier:{ supplierId:'S039', supplierName:'Farm Fresh Ghee', rating:4.4, reviewCount:92, price:550, unit:'Kg', location:'Bengaluru', responseRate:85, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'14 yrs' } },
  { productId:'P010', productName:'Pure Desi Ghee', category:'Dairy & Frozen', variety:'Traditional', image:'https://images.unsplash.com/photo-1619614812765-cbf2f093628b?w=400&h=400&fit=crop', supplier:{ supplierId:'S040', supplierName:'Organic Ghee House', rating:4.2, reviewCount:66, price:450, unit:'Kg', location:'Hyderabad', responseRate:78, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs' } },

  // ── P011 Frozen Vegetables ────────────────────────────────────────────────
  { productId:'P011', productName:'Frozen Mixed Vegetables', category:'Dairy & Frozen', variety:'Mixed', image:'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', supplier:{ supplierId:'S041', supplierName:'FrozenVeg Co', rating:4.3, reviewCount:71, price:65, unit:'Kg', location:'Mumbai', responseRate:82, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'11 yrs' } },
  { productId:'P011', productName:'Frozen Mixed Vegetables', category:'Dairy & Frozen', variety:'Mixed', image:'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', supplier:{ supplierId:'S042', supplierName:'Cold Storage Veggies', rating:4.5, reviewCount:95, price:70, unit:'Kg', location:'Pune', responseRate:88, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'13 yrs' } },
  { productId:'P011', productName:'Frozen Mixed Vegetables', category:'Dairy & Frozen', variety:'Mixed', image:'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', supplier:{ supplierId:'S043', supplierName:'Fresh Freeze Ltd', rating:4.1, reviewCount:48, price:75, unit:'Kg', location:'Chennai', responseRate:75, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'7 yrs' } },
  { productId:'P011', productName:'Frozen Mixed Vegetables', category:'Dairy & Frozen', variety:'Mixed', image:'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400&h=400&fit=crop', supplier:{ supplierId:'S044', supplierName:'Quick Freeze Foods', rating:3.9, reviewCount:35, price:55, unit:'Kg', location:'Thane', responseRate:67, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'5 yrs' } },

  // ── P012 Paneer ───────────────────────────────────────────────────────────
  { productId:'P012', productName:'Paneer (Cottage Cheese)', category:'Dairy & Frozen', variety:'Fresh', image:'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019', supplier:{ supplierId:'S045', supplierName:'Paneer Palace', rating:4.6, reviewCount:124, price:320, unit:'Kg', location:'Mumbai', responseRate:89, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'16 yrs' } },
  { productId:'P012', productName:'Paneer (Cottage Cheese)', category:'Dairy & Frozen', variety:'Fresh', image:'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019', supplier:{ supplierId:'S046', supplierName:'Fresh Cottage Dairy', rating:4.4, reviewCount:87, price:300, unit:'Kg', location:'Pune', responseRate:84, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'12 yrs' } },
  { productId:'P012', productName:'Paneer (Cottage Cheese)', category:'Dairy & Frozen', variety:'Fresh', image:'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019', supplier:{ supplierId:'S047', supplierName:'Cheese Corner', rating:4.7, reviewCount:156, price:340, unit:'Kg', location:'Hyderabad', responseRate:92, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'19 yrs' } },
  { productId:'P012', productName:'Paneer (Cottage Cheese)', category:'Dairy & Frozen', variety:'Fresh', image:'https://himalayancreamery.com/cdn/shop/files/WhatsAppImage2025-06-17at15.03.17_2_dc58008d-b4c8-44c1-8dd7-ee0a26ffe1b9.jpg?v=1751224019', supplier:{ supplierId:'S048', supplierName:'Dairy Delights', rating:4.2, reviewCount:63, price:280, unit:'Kg', location:'Bengaluru', responseRate:76, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },

  // ── P013 Potato Chips ─────────────────────────────────────────────────────
  { productId:'P013', productName:'Potato Chips (Party Pack)', category:'Packaged Foods', variety:'Masala', image:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', supplier:{ supplierId:'S049', supplierName:'Crispy Snacks Ltd', rating:4.3, reviewCount:94, price:195, unit:'Kg', location:'Mumbai', responseRate:83, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'14 yrs' } },
  { productId:'P013', productName:'Potato Chips (Party Pack)', category:'Packaged Foods', variety:'Masala', image:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', supplier:{ supplierId:'S050', supplierName:'Party Chips Co', rating:4.5, reviewCount:118, price:210, unit:'Kg', location:'Pune', responseRate:87, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'17 yrs' } },
  { productId:'P013', productName:'Potato Chips (Party Pack)', category:'Packaged Foods', variety:'Masala', image:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', supplier:{ supplierId:'S051', supplierName:'Snack Masters', rating:4.1, reviewCount:67, price:220, unit:'Kg', location:'Bengaluru', responseRate:77, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs' } },
  { productId:'P013', productName:'Potato Chips (Party Pack)', category:'Packaged Foods', variety:'Masala', image:'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop', supplier:{ supplierId:'S052', supplierName:'Crunchy Delights', rating:3.9, reviewCount:42, price:180, unit:'Kg', location:'Chennai', responseRate:70, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'6 yrs' } },

  // ── P014 Cream Biscuits ───────────────────────────────────────────────────
  { productId:'P014', productName:'Cream Biscuits', category:'Packaged Foods', variety:'Sweet', image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', supplier:{ supplierId:'S053', supplierName:'Biscuit Bazaar', rating:4.4, reviewCount:103, price:145, unit:'Kg', location:'Mumbai', responseRate:85, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P014', productName:'Cream Biscuits', category:'Packaged Foods', variety:'Sweet', image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', supplier:{ supplierId:'S054', supplierName:'Cookie Craze', rating:4.6, reviewCount:132, price:155, unit:'Kg', location:'Pune', responseRate:90, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'18 yrs' } },
  { productId:'P014', productName:'Cream Biscuits', category:'Packaged Foods', variety:'Sweet', image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', supplier:{ supplierId:'S055', supplierName:'Creamy Treats', rating:4.2, reviewCount:76, price:160, unit:'Kg', location:'Hyderabad', responseRate:79, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'11 yrs' } },
  { productId:'P014', productName:'Cream Biscuits', category:'Packaged Foods', variety:'Sweet', image:'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop', supplier:{ supplierId:'S056', supplierName:'Sweet Bites', rating:4.0, reviewCount:51, price:120, unit:'Kg', location:'Thane', responseRate:72, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'8 yrs' } },

  // ── P015 Instant Noodles ──────────────────────────────────────────────────
  { productId:'P015', productName:'Instant Noodles (Bulk)', category:'Packaged Foods', variety:'Vegetarian', image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop', supplier:{ supplierId:'S057', supplierName:'Noodle Nation', rating:4.3, reviewCount:89, price:265, unit:'Kg', location:'Mumbai', responseRate:84, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'13 yrs' } },
  { productId:'P015', productName:'Instant Noodles (Bulk)', category:'Packaged Foods', variety:'Vegetarian', image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop', supplier:{ supplierId:'S058', supplierName:'Quick Meals Ltd', rating:4.5, reviewCount:114, price:250, unit:'Kg', location:'Pune', responseRate:88, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'16 yrs' } },
  { productId:'P015', productName:'Instant Noodles (Bulk)', category:'Packaged Foods', variety:'Vegetarian', image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop', supplier:{ supplierId:'S059', supplierName:'Insta Foods Co', rating:4.1, reviewCount:62, price:280, unit:'Kg', location:'Bengaluru', responseRate:76, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },
  { productId:'P015', productName:'Instant Noodles (Bulk)', category:'Packaged Foods', variety:'Vegetarian', image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop', supplier:{ supplierId:'S060', supplierName:'Fast Food Supplies', rating:3.9, reviewCount:44, price:240, unit:'Kg', location:'Chennai', responseRate:69, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'6 yrs' } },

  // ── P016 Dark Chocolate ───────────────────────────────────────────────────
  { productId:'P016', productName:'Dark Chocolate Bars', category:'Packaged Foods', variety:'70% Cocoa', image:'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop', supplier:{ supplierId:'S061', supplierName:'Choco Paradise', rating:4.7, reviewCount:167, price:520, unit:'Kg', location:'Mumbai', responseRate:93, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'21 yrs' } },
  { productId:'P016', productName:'Dark Chocolate Bars', category:'Packaged Foods', variety:'70% Cocoa', image:'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop', supplier:{ supplierId:'S062', supplierName:'Cocoa Delights', rating:4.5, reviewCount:129, price:485, unit:'Kg', location:'Pune', responseRate:87, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'17 yrs' } },
  { productId:'P016', productName:'Dark Chocolate Bars', category:'Packaged Foods', variety:'70% Cocoa', image:'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop', supplier:{ supplierId:'S063', supplierName:'Premium Chocolate Ltd', rating:4.8, reviewCount:203, price:550, unit:'Kg', location:'Bengaluru', responseRate:95, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'24 yrs' } },
  { productId:'P016', productName:'Dark Chocolate Bars', category:'Packaged Foods', variety:'70% Cocoa', image:'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop', supplier:{ supplierId:'S064', supplierName:'Dark Treats Co', rating:4.3, reviewCount:84, price:450, unit:'Kg', location:'Hyderabad', responseRate:80, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'13 yrs' } },

  // ── P017 Cornflakes ───────────────────────────────────────────────────────
  { productId:'P017', productName:'Cornflakes', category:'Packaged Foods', variety:'Honey', image:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop', supplier:{ supplierId:'S065', supplierName:'Cereal King', rating:4.4, reviewCount:96, price:255, unit:'Kg', location:'Mumbai', responseRate:85, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'14 yrs' } },
  { productId:'P017', productName:'Cornflakes', category:'Packaged Foods', variety:'Honey', image:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop', supplier:{ supplierId:'S066', supplierName:'Morning Crunch', rating:4.6, reviewCount:127, price:270, unit:'Kg', location:'Pune', responseRate:89, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'17 yrs' } },
  { productId:'P017', productName:'Cornflakes', category:'Packaged Foods', variety:'Honey', image:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop', supplier:{ supplierId:'S067', supplierName:'Breakfast Bliss', rating:4.2, reviewCount:71, price:280, unit:'Kg', location:'Bengaluru', responseRate:78, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs' } },
  { productId:'P017', productName:'Cornflakes', category:'Packaged Foods', variety:'Honey', image:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop', supplier:{ supplierId:'S068', supplierName:'Golden Grains', rating:4.0, reviewCount:52, price:220, unit:'Kg', location:'Chennai', responseRate:71, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'8 yrs' } },

  // ── P018 Masala Namkeen ───────────────────────────────────────────────────
  { productId:'P018', productName:'Masala Namkeen', category:'Packaged Foods', variety:'Spicy', image:'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', supplier:{ supplierId:'S069', supplierName:'Namkeen Palace', rating:4.5, reviewCount:109, price:205, unit:'Kg', location:'Mumbai', responseRate:86, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P018', productName:'Masala Namkeen', category:'Packaged Foods', variety:'Spicy', image:'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', supplier:{ supplierId:'S070', supplierName:'Spicy Snacks Co', rating:4.3, reviewCount:87, price:195, unit:'Kg', location:'Pune', responseRate:82, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'12 yrs' } },
  { productId:'P018', productName:'Masala Namkeen', category:'Packaged Foods', variety:'Spicy', image:'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', supplier:{ supplierId:'S071', supplierName:'Crunchy Namkeens', rating:4.6, reviewCount:138, price:230, unit:'Kg', location:'Hyderabad', responseRate:91, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'18 yrs' } },
  { productId:'P018', productName:'Masala Namkeen', category:'Packaged Foods', variety:'Spicy', image:'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', supplier:{ supplierId:'S072', supplierName:'Masala Treats', rating:4.1, reviewCount:58, price:180, unit:'Kg', location:'Thane', responseRate:74, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },

  // ── P019 Detergent ────────────────────────────────────────────────────────
  { productId:'P019', productName:'Detergent Powder (Bulk)', category:'Home & Personal Care', variety:'Extra Clean', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', supplier:{ supplierId:'S073', supplierName:'Clean House Ltd', rating:4.4, reviewCount:102, price:105, unit:'Kg', location:'Mumbai', responseRate:84, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P019', productName:'Detergent Powder (Bulk)', category:'Home & Personal Care', variety:'Extra Clean', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', supplier:{ supplierId:'S074', supplierName:'Super Wash Co', rating:4.6, reviewCount:135, price:110, unit:'Kg', location:'Pune', responseRate:89, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'18 yrs' } },
  { productId:'P019', productName:'Detergent Powder (Bulk)', category:'Home & Personal Care', variety:'Extra Clean', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', supplier:{ supplierId:'S075', supplierName:'Sparkle Supplies', rating:4.2, reviewCount:76, price:115, unit:'Kg', location:'Bengaluru', responseRate:79, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'11 yrs' } },
  { productId:'P019', productName:'Detergent Powder (Bulk)', category:'Home & Personal Care', variety:'Extra Clean', image:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', supplier:{ supplierId:'S076', supplierName:'Fresh Cleaner', rating:3.9, reviewCount:49, price:85, unit:'Kg', location:'Hyderabad', responseRate:68, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'7 yrs' } },

  // ── P020 Floor Cleaner ────────────────────────────────────────────────────
  { productId:'P020', productName:'Floor Cleaner (Bulk)', category:'Home & Personal Care', variety:'Lemon Fresh', image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', supplier:{ supplierId:'S077', supplierName:'Floor Shine Ltd', rating:4.4, reviewCount:98, price:95, unit:'L', location:'Mumbai', responseRate:85, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'14 yrs' } },
  { productId:'P020', productName:'Floor Cleaner (Bulk)', category:'Home & Personal Care', variety:'Lemon Fresh', image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', supplier:{ supplierId:'S078', supplierName:'Sparkle Floors', rating:4.6, reviewCount:124, price:85, unit:'L', location:'Pune', responseRate:90, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'17 yrs' } },
  { productId:'P020', productName:'Floor Cleaner (Bulk)', category:'Home & Personal Care', variety:'Lemon Fresh', image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', supplier:{ supplierId:'S079', supplierName:'Clean Surface Co', rating:4.2, reviewCount:73, price:90, unit:'L', location:'Hyderabad', responseRate:78, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'10 yrs' } },
  { productId:'P020', productName:'Floor Cleaner (Bulk)', category:'Home & Personal Care', variety:'Lemon Fresh', image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop', supplier:{ supplierId:'S080', supplierName:'Fresh Floors', rating:4.0, reviewCount:55, price:65, unit:'L', location:'Thane', responseRate:70, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'8 yrs' } },

  // ── P021 Toothpaste ───────────────────────────────────────────────────────
  { productId:'P021', productName:'Toothpaste (Pack of 12)', category:'Home & Personal Care', variety:'Mint', image:'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop', supplier:{ supplierId:'S081', supplierName:'Oral Care Supplies', rating:4.5, reviewCount:117, price:135, unit:'Pack', location:'Mumbai', responseRate:88, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'16 yrs' } },
  { productId:'P021', productName:'Toothpaste (Pack of 12)', category:'Home & Personal Care', variety:'Mint', image:'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop', supplier:{ supplierId:'S082', supplierName:'Dental Essentials', rating:4.7, reviewCount:152, price:120, unit:'Pack', location:'Pune', responseRate:93, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'20 yrs' } },
  { productId:'P021', productName:'Toothpaste (Pack of 12)', category:'Home & Personal Care', variety:'Mint', image:'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop', supplier:{ supplierId:'S083', supplierName:'Smile Fresh Co', rating:4.3, reviewCount:88, price:130, unit:'Pack', location:'Bengaluru', responseRate:82, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'13 yrs' } },
  { productId:'P021', productName:'Toothpaste (Pack of 12)', category:'Home & Personal Care', variety:'Mint', image:'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop', supplier:{ supplierId:'S084', supplierName:'Fresh Breath Traders', rating:4.1, reviewCount:64, price:95, unit:'Pack', location:'Chennai', responseRate:74, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },

  // ── P022 Bath Soap ────────────────────────────────────────────────────────
  { productId:'P022', productName:'Bath Soap Bar (Bulk)', category:'Soap & Personal Hygiene', variety:'Rose', image:'https://images.unsplash.com/photo-1583947582774-eb09a0bc0b7e?w=400&h=400&fit=crop', supplier:{ supplierId:'S085', supplierName:'Soap Factory India', rating:4.5, reviewCount:109, price:48, unit:'Piece', location:'Mumbai', responseRate:86, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P022', productName:'Bath Soap Bar (Bulk)', category:'Soap & Personal Hygiene', variety:'Rose', image:'https://images.unsplash.com/photo-1583947582774-eb09a0bc0b7e?w=400&h=400&fit=crop', supplier:{ supplierId:'S086', supplierName:'Pure Soap Co', rating:4.7, reviewCount:148, price:42, unit:'Piece', location:'Pune', responseRate:92, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'19 yrs' } },
  { productId:'P022', productName:'Bath Soap Bar (Bulk)', category:'Soap & Personal Hygiene', variety:'Rose', image:'https://images.unsplash.com/photo-1583947582774-eb09a0bc0b7e?w=400&h=400&fit=crop', supplier:{ supplierId:'S087', supplierName:'Hygiene Makers', rating:4.2, reviewCount:76, price:55, unit:'Piece', location:'Bengaluru', responseRate:79, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'11 yrs' } },

  // ── P023 Liquid Handwash ──────────────────────────────────────────────────
  { productId:'P023', productName:'Liquid Handwash (Bulk)', category:'Soap & Personal Hygiene', variety:'Antibacterial', image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', supplier:{ supplierId:'S088', supplierName:'Germ Guard Ltd', rating:4.6, reviewCount:132, price:95, unit:'L', location:'Mumbai', responseRate:89, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'17 yrs' } },
  { productId:'P023', productName:'Liquid Handwash (Bulk)', category:'Soap & Personal Hygiene', variety:'Antibacterial', image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', supplier:{ supplierId:'S089', supplierName:'Hygiene First', rating:4.8, reviewCount:175, price:115, unit:'L', location:'Pune', responseRate:94, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'21 yrs' } },
  { productId:'P023', productName:'Liquid Handwash (Bulk)', category:'Soap & Personal Hygiene', variety:'Antibacterial', image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', supplier:{ supplierId:'S090', supplierName:'Clean Hand Supplies', rating:4.3, reviewCount:87, price:80, unit:'L', location:'Bengaluru', responseRate:81, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'13 yrs' } },
  { productId:'P023', productName:'Liquid Handwash (Bulk)', category:'Soap & Personal Hygiene', variety:'Antibacterial', image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', supplier:{ supplierId:'S091', supplierName:'Safe Touch Co', rating:4.1, reviewCount:58, price:120, unit:'L', location:'Hyderabad', responseRate:75, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'9 yrs' } },

  // ── P024 Shampoo ──────────────────────────────────────────────────────────
  { productId:'P024', productName:'Shampoo (Bulk 5L)', category:'Soap & Personal Hygiene', variety:'Hair Care', image:'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop', supplier:{ supplierId:'S092', supplierName:'Salon Pro Supplies', rating:4.7, reviewCount:158, price:480, unit:'L', location:'Mumbai', responseRate:92, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'19 yrs' } },
  { productId:'P024', productName:'Shampoo (Bulk 5L)', category:'Soap & Personal Hygiene', variety:'Hair Care', image:'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop', supplier:{ supplierId:'S093', supplierName:'Hair Essentials Ltd', rating:4.5, reviewCount:121, price:420, unit:'L', location:'Pune', responseRate:87, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'15 yrs' } },
  { productId:'P024', productName:'Shampoo (Bulk 5L)', category:'Soap & Personal Hygiene', variety:'Hair Care', image:'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&h=400&fit=crop', supplier:{ supplierId:'S094', supplierName:'Beauty Pro Corp', rating:4.3, reviewCount:89, price:500, unit:'L', location:'Bengaluru', responseRate:82, hasGST:true, hasEmail:true, hasMobile:true, memberSince:'12 yrs' } }
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  await connectDB();

  // Clear existing data
  await Promise.all([
    B2BSection.deleteMany({}),
    B2BCategory.deleteMany({}),
    B2BCatalogProduct.deleteMany({}),
    B2BMarketplaceProduct.deleteMany({})
  ]);
  console.log('🗑️  Cleared existing B2B data');

  await B2BSection.insertMany(sections);
  console.log(`✅ Seeded ${sections.length} sections`);

  await B2BCategory.insertMany(categories);
  console.log(`✅ Seeded ${categories.length} categories`);

  await B2BCatalogProduct.insertMany(catalogProducts);
  console.log(`✅ Seeded ${catalogProducts.length} catalog products`);

  await B2BMarketplaceProduct.insertMany(marketplaceProducts);
  console.log(`✅ Seeded ${marketplaceProducts.length} marketplace listings`);

  console.log('\n🎉 B2B seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
