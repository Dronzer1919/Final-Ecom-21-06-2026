# Seed Data Import Guide

This folder contains JSON files for importing initial data into MongoDB.

## Import Order (IMPORTANT!)

Products have dependencies on other collections, so **import in this order**:

### Step 1: Import Base Collections (No Dependencies)
1. **brands.json** → `brands` collection
2. **categories.json** → `categories` collection
3. **units.json** → `units` collection
4. **stores.json** → `stores` collection
5. **warehouses.json** → `warehouses` collection

### Step 2: Import Collections with Dependencies
6. **subcategories.json** → `subcategories` collection
   - After import, you need to update each subcategory with its `category` ObjectId

### Step 3: Import Products (Last!)
7. **products.json** → `products` collection
   - **IMPORTANT**: Products require the following ObjectIds:
     - `store` - from stores collection
     - `warehouse` - from warehouses collection
     - `category` - from categories collection
     - `subCategory` - from subcategories collection
     - `brand` - from brands collection
     - `unit` - from units collection

## How to Import in MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Select your database (e.g., `ecommerce`)
4. For each JSON file:
   - Click on the collection name (create it if it doesn't exist)
   - Click **ADD DATA** → **Import JSON or CSV file**
   - Select the JSON file
   - Click **Import**

## Updating Product References

After importing all base collections, you'll need to update the products.json file with actual ObjectIds from your database, or use the backend API to create products with proper references.

### Option 1: Manual Update
1. Get ObjectIds from each collection in Compass
2. Update products.json with actual ObjectIds
3. Re-import products

### Option 2: Use Backend API (Recommended)
Use the POST `/api/products/create` endpoint with proper ObjectIds from your database.

## Files Included

- **brands.json** - 15 brands (Apple, Samsung, Nike, etc.)
- **categories.json** - 10 categories (Electronics, Fashion, etc.)
- **subcategories.json** - 12 subcategories (Smartphones, Laptops, etc.)
- **products.json** - 14 products (iPhone, MacBook, etc.)
- **stores.json** - 3 stores (Main Store, Delhi Branch, Bangalore Store)
- **warehouses.json** - 3 warehouses (Central, South, West)
- **units.json** - 8 units (Piece, Kilogram, Liter, etc.)

## Note

The products.json file contains placeholder values for references (e.g., store: '1'). These need to be replaced with actual MongoDB ObjectIds after importing the dependent collections.
