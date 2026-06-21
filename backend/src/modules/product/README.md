# Product Module

Complete CRUD operations for Product management.

## Structure

```
product/
├── product.model.js       # Mongoose schema and model
├── product.controller.js  # Business logic
├── product.middleware.js  # Validation middleware
├── product.routes.js      # API routes
└── README.md             # Documentation
```

## API Endpoints

### Create Product
- **POST** `/api/products/create`
- **Body:**
```json
{
  "name": "iPhone 14 64GB",
  "category": "Mobiles",
  "price": 15800,
  "description": "Latest iPhone model",
  "stock": 50,
  "sku": "IPH14-64",
  "barcode": "123456789",
  "brand": "Apple",
  "unit": "Piece",
  "status": "Active",
  "image": "📱"
}
```

### Get All Products
- **GET** `/api/products`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `category` (optional)
  - `status` (optional: Active/Inactive)
  - `search` (optional: text search)
  - `sortBy` (optional: name, price, stock, createdAt, updatedAt)
  - `order` (optional: asc, desc)

**Example:**
```
GET /api/products?page=1&limit=10&category=Mobiles&status=Active&sortBy=price&order=desc
```

### Get Product by ID
- **GET** `/api/products/:id`

### Update Product
- **PUT** `/api/products/:id`
- **Body:** (any fields to update)

### Delete Product
- **DELETE** `/api/products/:id`
- Soft delete (sets isDeleted: true)

### Get Products by Category
- **GET** `/api/products/category/:category`
- **Example:** `/api/products/category/Mobiles`

### Get Low Stock Products
- **GET** `/api/products/low-stock/alert`
- Returns products with stock < 10

## Model Schema

```javascript
{
  name: String (required),
  category: String (required),
  price: Number (required),
  description: String,
  image: String,
  stock: Number (default: 0),
  sku: String (unique),
  barcode: String (unique),
  brand: String,
  unit: String (default: 'Piece'),
  status: String (Active/Inactive, default: Active),
  isDeleted: Boolean (default: false),
  timestamps: true (createdAt, updatedAt)
}
```

## Usage in server.js

```javascript
const productRoutes = require('./modules/product/product.routes');
app.use('/api/products', productRoutes);
```
