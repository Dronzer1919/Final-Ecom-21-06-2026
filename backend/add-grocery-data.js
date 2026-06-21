/**
 * One-time script to add missing Grocery subcategories and units to the database.
 * Run with: node add-grocery-data.js
 *
 * This does NOT wipe existing data — it only inserts missing records.
 */
require('dotenv').config(); // loads .env from backend root (same folder as this script)
const mongoose = require('mongoose');

// Try both possible env var names
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌  MONGODB_URI not found in environment. Check your .env file.');
  process.exit(1);
}

const categorySchema = new mongoose.Schema({ name: String, code: String, description: String, image: String, isActive: Boolean }, { strict: false });
const subcategorySchema = new mongoose.Schema({ name: String, code: String, description: String, category: mongoose.Schema.Types.ObjectId, isActive: Boolean }, { strict: false });
const unitSchema = new mongoose.Schema({ name: String, code: String, shortName: String, isActive: Boolean }, { strict: false });

const Category    = mongoose.models.Category    || mongoose.model('Category',    categorySchema);
const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
const Unit        = mongoose.models.Unit        || mongoose.model('Unit',        unitSchema);

const GROCERY_SUBCATEGORIES = [
  { name: 'Rice',   code: 'SUB013', description: 'Basmati, Sona Masoori, and other rice varieties', isActive: true },
  { name: 'Pulses', code: 'SUB014', description: 'Lentils, dal, and dried pulses',                  isActive: true },
  { name: 'Spices', code: 'SUB015', description: 'Whole and ground spices',                          isActive: true },
  { name: 'Oil',    code: 'SUB016', description: 'Edible oils for cooking',                          isActive: true },
  { name: 'Sugar',  code: 'SUB017', description: 'Refined and raw sugar varieties',                  isActive: true },
];

const NEW_UNITS = [
  { name: 'Bag',    code: 'BAG', shortName: 'bag', isActive: true },
  { name: 'Carton', code: 'CTN', shortName: 'ctn', isActive: true },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  // ── Units ────────────────────────────────────────────────────────────────────
  console.log('📦  Adding missing units…');
  for (const u of NEW_UNITS) {
    const existing = await Unit.findOne({ name: new RegExp(`^${u.name}$`, 'i') });
    if (existing) {
      console.log(`   ⚠️  Unit "${u.name}" already exists — skipped`);
    } else {
      await Unit.create(u);
      console.log(`   ✅  Created unit: ${u.name}`);
    }
  }

  // ── Grocery category ─────────────────────────────────────────────────────────
  console.log('\n📦  Looking up "Grocery" category…');
  const grocery = await Category.findOne({ name: new RegExp('^Grocery$', 'i') });
  if (!grocery) {
    console.error('   ❌  Category "Grocery" not found. Have you run the main seed? (node src/seedDatabase.js)');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`   ✅  Found: ${grocery.name} (${grocery._id})`);

  // ── Subcategories ─────────────────────────────────────────────────────────────
  console.log('\n📦  Adding missing Grocery subcategories…');
  for (const sub of GROCERY_SUBCATEGORIES) {
    const existing = await Subcategory.findOne({ name: new RegExp(`^${sub.name}$`, 'i'), category: grocery._id });
    if (existing) {
      console.log(`   ⚠️  Subcategory "${sub.name}" already exists — skipped`);
    } else {
      await Subcategory.create({ ...sub, category: grocery._id });
      console.log(`   ✅  Created subcategory: ${sub.name}`);
    }
  }

  console.log('\n🎉  Done! You can now re-upload the grocery products via Bulk Upload.');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌  Error:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
