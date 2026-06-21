const Product = require('./product.model');
const Category = require('../category/category.model');
const Brand = require('../brand/brand.model');
const Store = require('../store/store.model');
const Warehouse = require('../warehouse/warehouse.model');
const Subcategory = require('../subcategory/subcategory.model');
const Unit = require('../unit/unit.model');
const Barcode = require('../barcode/barcode.model');
const Vendor = require('../vendor/vendor.model');
const { B2BCatalogProduct, B2BMarketplaceProduct } = require('../b2b/b2b.model');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Copy productName to name if name is not provided
    if (productData.productName && !productData.name) {
      productData.name = productData.productName;
    }

    // Convert empty ObjectId-reference strings to undefined so Mongoose doesn't try to cast them
    const refFields = ['brand', 'subCategory'];
    refFields.forEach(field => {
      if (productData[field] === '') {
        delete productData[field];
      }
    });

    // Check if product with same SKU exists (only if SKU is provided)
    if (productData.sku) {
      const existingProduct = await Product.findOne({ 
        sku: productData.sku,
        isDeleted: false 
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Check if slug exists (only if slug is provided)
    if (productData.slug) {
      const existingSlug = await Product.findOne({ 
        slug: productData.slug,
        isDeleted: false 
      });

      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists'
        });
      }
    }

    // Create new product
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Product with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      brand,
      status,
      isB2B,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { isDeleted: false };

    // Filter B2B products only
    if (isB2B === 'true') query.isB2B = true;

    // Separate filters array for combining conditions
    const filters = [];

    // Filter by category — accepts ObjectId or name
    if (category) {
      const mongoose = require('mongoose');
      const isId = mongoose.Types.ObjectId.isValid(category);
      const categoryDoc = isId
        ? await Category.findById(category)
        : await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      if (categoryDoc) {
        filters.push({ category: categoryDoc._id });
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), pages: 0 }
        });
      }
    }

    // Filter by brand name if provided
    if (brand) {
      const brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${brand}$`, 'i') } });
      if (brandDoc) {
        filters.push({ brand: brandDoc._id });
      } else {
        // If brand is provided but not found, return empty results
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 0
          }
        });
      }
    }

    if (status) {
      filters.push({ status: status });
    }

    // Enhanced search: search in product name, productName, description, and itemCode
    // Also search in populated category and brand names
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Find matching categories and brands
      const matchingCategories = await Category.find({ name: searchRegex }).select('_id');
      const matchingBrands = await Brand.find({ name: searchRegex }).select('_id');
      
      const categoryIds = matchingCategories.map(cat => cat._id);
      const brandIds = matchingBrands.map(br => br._id);
      
      // Search in multiple fields including references
      const searchConditions = [
        { name: searchRegex },
        { productName: searchRegex },
        { description: searchRegex },
        { itemCode: searchRegex }
      ];
      
      // Add category and brand ID matches if found
      if (categoryIds.length > 0) {
        searchConditions.push({ category: { $in: categoryIds } });
      }
      if (brandIds.length > 0) {
        searchConditions.push({ brand: { $in: brandIds } });
      }
      
      filters.push({ $or: searchConditions });
    }
    
    // Combine all filters with AND logic
    if (filters.length > 0) {
      query.$and = filters;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name')
      .populate('unit', 'name shortName')
      .populate('store', 'name')
      .populate('warehouse', 'name')
      .populate('barcodeSymbology', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    // Attach vendorCount from B2BCatalogProduct for B2B products
    const productIds = products.map(p => p._id.toString());
    const catalogDocs = await B2BCatalogProduct.find({ productId: { $in: productIds } })
      .select('productId vendorCount priceRange').lean();
    const catalogMap = {};
    catalogDocs.forEach(c => { catalogMap[c.productId] = c; });

    const enriched = products.map(p => {
      const obj = p.toObject();
      const catalog = catalogMap[p._id.toString()];
      if (catalog) {
        obj.vendorCount = catalog.vendorCount ?? 0;
        obj.priceRange  = catalog.priceRange ?? null;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      category,
      status: 'Active',
      isDeleted: false
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lt: 10 },
      status: 'Active',
      isDeleted: false
    }).sort({ stock: 1 });

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
    });
  }
};

// Shared helper: build case-insensitive name→_id map for a model
const buildNameMap = async (Model, names, field = 'name') => {
  const uniqueNames = [...new Set(names.filter(Boolean).map(n => String(n).trim()))];
  if (uniqueNames.length === 0) return {};
  const docs = await Model.find({ [field]: { $in: uniqueNames.map(n => new RegExp(`^${n}$`, 'i')) } }).select(`_id ${field}`);
  const map = {};
  docs.forEach(doc => { map[doc[field].toLowerCase()] = doc._id; });
  return map;
};

// Bulk create products — accepts an array of product rows with name-based references
exports.bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'products array is required and must not be empty'
      });
    }

    // Collect all unique reference names from every row
    const storeNames       = products.map(p => p.store);
    const warehouseNames   = products.map(p => p.warehouse);
    const categoryNames    = products.map(p => p.category);
    const subCategoryNames = products.map(p => p.subCategory);
    const brandNames       = products.map(p => p.brand);
    const unitNames        = products.map(p => p.unit);
    const barcodeNames     = products.map(p => p.barcodeSymbology);
    const vendorNames      = products.map(p => p.vendorName);

    // Pre-fetch all lookup maps in parallel
    const [storeMap, warehouseMap, categoryMap, subCategoryMap, brandMap, unitMap, barcodeMap, vendorMap, defaultBarcode] = await Promise.all([
      buildNameMap(Store,       storeNames),
      buildNameMap(Warehouse,   warehouseNames),
      buildNameMap(Category,    categoryNames),
      buildNameMap(Subcategory, subCategoryNames),
      buildNameMap(Brand,       brandNames),
      buildNameMap(Unit,        unitNames),
      buildNameMap(Barcode,     barcodeNames),
      buildNameMap(Vendor,      vendorNames),
      Barcode.findOne({ name: { $in: ['CODE128', 'EAN13', 'QR'] } }).select('_id'),
    ]);

    const results = [];
    let createdCount = 0;
    let failedCount  = 0;

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const rowNum = i + 1;

      // Resolve references
      const storeId       = row.store       ? storeMap[String(row.store).trim().toLowerCase()]       : null;
      const warehouseId   = row.warehouse   ? warehouseMap[String(row.warehouse).trim().toLowerCase()]   : null;
      const categoryId    = row.category    ? categoryMap[String(row.category).trim().toLowerCase()]    : null;
      const subCategoryId = row.subCategory ? subCategoryMap[String(row.subCategory).trim().toLowerCase()] : null;
      const brandId       = row.brand       ? brandMap[String(row.brand).trim().toLowerCase()]       : null;
      const unitId        = row.unit        ? unitMap[String(row.unit).trim().toLowerCase()]        : null;
      const barcodeId     = row.barcodeSymbology ? barcodeMap[String(row.barcodeSymbology).trim().toLowerCase()] : null;

      // Validate required references
      const missingRefs = [];
      if (row.store       && !storeId)       missingRefs.push(`Store "${row.store}" not found`);
      if (row.warehouse   && !warehouseId)   missingRefs.push(`Warehouse "${row.warehouse}" not found`);
      if (row.category    && !categoryId)    missingRefs.push(`Category "${row.category}" not found`);
      if (row.subCategory && !subCategoryId) missingRefs.push(`Sub Category "${row.subCategory}" not found`);
      if (row.unit        && !unitId)        missingRefs.push(`Unit "${row.unit}" not found`);

      if (!storeId || !warehouseId || !categoryId || !subCategoryId || !unitId) {
        failedCount++;
        results.push({ row: rowNum, productName: row.productName || row.name, success: false, errors: missingRefs });
        continue;
      }

      try {
        const boolVal = v => ['yes', 'true', '1', true].includes(typeof v === 'string' ? v.toLowerCase() : v);

        const productData = {
          store:            storeId,
          warehouse:        warehouseId,
          category:         categoryId,
          subCategory:      subCategoryId,
          brand:            brandId || undefined,
          unit:             unitId,
          barcodeSymbology: barcodeId || (defaultBarcode ? defaultBarcode._id : undefined),
          itemCode:         row.itemCode,
          name:             row.productName || row.name,
          productName:      row.productName || row.name,
          slug: ((row.productName || row.name) + '-' + Date.now() + '-' + i)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
          description:      row.description || '',
          quantity:         Number(row.quantity) || 0,
          price:            Number(row.price) || 0,
          taxType:          row.taxType || 'Exclusive',
          discountType:     row.discountType || 'None',
          discountValue:    Number(row.discountValue) || 0,
          quantityAlert:    Number(row.quantityAlert) || 10,
          warranty:         row.warranty || '',
          manufacturer:     row.manufacturer || '',
          manufacturedDate: row.manufacturedDate || undefined,
          expiryOn:         row.expiryOn || undefined,
          status:           row.status || 'Active',
          images:           Array.isArray(row.images) ? row.images.filter(Boolean) : [],
          // B2B fields
          isB2B:            true,
          variety:          row.variety || undefined,
          minOrderQuantity: Number(row.minOrderQuantity) || 1,
          supplierLocation: row.supplierLocation || undefined,
          responseRate:     row.responseRate !== undefined ? Number(row.responseRate) : 100,
          hasGST:           boolVal(row.hasGST),
        };

        const product = new Product(productData);
        await product.save();
        createdCount++;

        // Link product to vendor if vendorName provided
        if (row.vendorName) {
          const vendorId = vendorMap[String(row.vendorName).trim().toLowerCase()];
          if (vendorId) {
            await Vendor.findByIdAndUpdate(vendorId, { $addToSet: { productIds: product._id } });
          }
        }

        results.push({ row: rowNum, productName: productData.name, success: true, id: product._id });
      } catch (err) {
        failedCount++;
        let errMsg = err.message;
        if (err.code === 11000) {
          const field = Object.keys(err.keyPattern)[0];
          errMsg = `Duplicate ${field}`;
        }
        results.push({ row: rowNum, productName: row.productName || row.name, success: false, errors: [errMsg] });
      }
    }

    res.status(200).json({
      success: true,
      message: `${createdCount} product(s) created, ${failedCount} failed.`,
      data: { created: createdCount, failed: failedCount, results }
    });
  } catch (error) {
    console.error('Error in bulk create products:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk product upload',
      error: error.message
    });
  }
};

// Bulk create products with multiple vendors per product.
// Also creates B2BMarketplaceProduct listings and B2BCatalogProduct entries so
// the storefront marketplace shows the correct vendors immediately.
exports.bulkCreateMultiVendorProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'products array is required and must not be empty'
      });
    }

    // ── 1. Collect all reference names ─────────────────────────────────────────
    const storeNames       = products.map(p => p.store);
    const warehouseNames   = products.map(p => p.warehouse);
    const categoryNames    = products.map(p => p.category);
    const subCategoryNames = products.map(p => p.subCategory);
    const unitNames        = products.map(p => p.unit);
    const brandNames       = products.map(p => p.brand);

    const allVendorNames = products.flatMap(p =>
      (p.vendors || []).map(v => v.vendorName).filter(Boolean)
    );
    const allVendorIds = products.flatMap(p =>
      (p.vendors || []).map(v => v.vendorId).filter(Boolean)
    );

    // ── 2. Pre-fetch all reference maps in parallel ────────────────────────────
    const [storeMap, warehouseMap, categoryMap, subCategoryMap, unitMap, brandMap, defaultBarcode,
           vendorDocsByName, vendorDocsById] = await Promise.all([
      buildNameMap(Store,       storeNames),
      buildNameMap(Warehouse,   warehouseNames),
      buildNameMap(Category,    categoryNames),
      buildNameMap(Subcategory, subCategoryNames),
      buildNameMap(Unit,        unitNames),
      buildNameMap(Brand,       brandNames),
      Barcode.findOne({ name: { $in: ['CODE128', 'EAN13', 'QR'] } }).select('_id'),
      // Full vendor docs keyed by name (for marketplace supplier fields)
      (async () => {
        const unique = [...new Set(allVendorNames.map(n => n.trim()))];
        if (!unique.length) return {};
        const docs = await Vendor.find({ name: { $in: unique.map(n => new RegExp(`^${n}$`, 'i')) } });
        const map = {};
        docs.forEach(v => { map[v.name.toLowerCase()] = v; });
        return map;
      })(),
      // Full vendor docs keyed by _id string (when frontend already resolved the ID)
      (async () => {
        const unique = [...new Set(allVendorIds)];
        if (!unique.length) return {};
        const docs = await Vendor.find({ _id: { $in: unique } });
        const map = {};
        docs.forEach(v => { map[v._id.toString()] = v; });
        return map;
      })(),
    ]);

    // Helper: resolve vendor entry → full Vendor document
    const resolveVendorDoc = (v) => {
      if (v.vendorId && vendorDocsById[v.vendorId]) return vendorDocsById[v.vendorId];
      if (v.vendorName && vendorDocsByName[v.vendorName.trim().toLowerCase()]) {
        return vendorDocsByName[v.vendorName.trim().toLowerCase()];
      }
      return null;
    };

    const results     = [];
    let createdCount  = 0;
    let failedCount   = 0;
    const boolVal = v => ['yes', 'true', '1', true].includes(typeof v === 'string' ? v.toLowerCase() : v);

    // ── 3. Create each product ─────────────────────────────────────────────────
    for (let i = 0; i < products.length; i++) {
      const row = products[i];

      const storeId       = row.store       ? storeMap[String(row.store).trim().toLowerCase()]             : null;
      const warehouseId   = row.warehouse   ? warehouseMap[String(row.warehouse).trim().toLowerCase()]     : null;
      const categoryId    = row.category    ? categoryMap[String(row.category).trim().toLowerCase()]       : null;
      const subCategoryId = row.subCategory ? subCategoryMap[String(row.subCategory).trim().toLowerCase()] : null;
      const unitId        = row.unit        ? unitMap[String(row.unit).trim().toLowerCase()]               : null;
      const brandId       = row.brand       ? brandMap[String(row.brand).trim().toLowerCase()]             : null;

      const missingRefs = [];
      if (row.store       && !storeId)       missingRefs.push(`Store "${row.store}" not found`);
      if (row.warehouse   && !warehouseId)   missingRefs.push(`Warehouse "${row.warehouse}" not found`);
      if (row.category    && !categoryId)    missingRefs.push(`Category "${row.category}" not found`);
      if (row.subCategory && !subCategoryId) missingRefs.push(`Sub Category "${row.subCategory}" not found`);
      if (row.unit        && !unitId)        missingRefs.push(`Unit "${row.unit}" not found`);

      if (!storeId || !warehouseId || !categoryId || !subCategoryId || !unitId) {
        failedCount++;
        results.push({ productName: row.productName || row.name, success: false, vendorCount: 0, errors: missingRefs });
        continue;
      }

      try {
        // Create the product
        const productData = {
          store:            storeId,
          warehouse:        warehouseId,
          category:         categoryId,
          subCategory:      subCategoryId,
          brand:            brandId || undefined,
          unit:             unitId,
          barcodeSymbology: defaultBarcode ? defaultBarcode._id : undefined,
          itemCode:         row.itemCode,
          name:             row.productName || row.name,
          productName:      row.productName || row.name,
          slug: ((row.productName || row.name) + '-' + Date.now() + '-' + i)
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          description:      row.description || '',
          quantity:         Number(row.quantity) || 0,
          price:            Number(row.price)    || 0,
          taxType:          row.taxType      || 'Exclusive',
          discountType:     row.discountType || 'None',
          discountValue:    Number(row.discountValue) || 0,
          quantityAlert:    Number(row.quantityAlert) || 10,
          status:           'Active',
          images:           [],
          isB2B:            true,
          variety:          row.variety || undefined,
          minOrderQuantity: Number(row.minOrderQuantity) || 1,
          hasGST:           boolVal(row.hasGST),
        };

        const product = new Product(productData);
        await product.save();
        createdCount++;

        const productIdStr = product._id.toString();
        const vendors      = Array.isArray(row.vendors) ? row.vendors : [];
        const vendorPrices = [];
        const marketplaceDocs = [];
        let linkedVendors  = 0;

        // ── 4. For each vendor: create marketplace listing ──────────────────────
        for (const v of vendors) {
          const dbVendor    = resolveVendorDoc(v);
          const vendorPrice = Number(v.vendorPrice) || Number(row.price);
          vendorPrices.push(vendorPrice);

          if (!dbVendor) continue;   // vendor name not found in DB — skip listing

          linkedVendors++;

          // Parse bulk pricing — frontend sends array or JSON string
          let bulkPricing = [];
          if (Array.isArray(v.bulkPricing) && v.bulkPricing.length > 0) {
            bulkPricing = v.bulkPricing
              .filter(t => t.quantity > 0 && t.price > 0)
              .map(t => ({
                quantity: Number(t.quantity),
                unit:     String(t.unit || row.unit || 'Kg'),
                price:    Number(t.price),
                discount: Number(t.discount || 0)
              }));
          }

          marketplaceDocs.push({
            productId:   productIdStr,
            productName: productData.name,
            category:    row.category,
            variety:     v.variety || dbVendor.variety || '',
            image:       '',
            supplier: {
              supplierId:   dbVendor._id.toString(),
              supplierName: dbVendor.name,
              rating:       dbVendor.rating       || 4.0,
              reviewCount:  dbVendor.reviewCount   || 0,
              price:        vendorPrice,
              unit:         row.unit               || 'Kg',
              location:     dbVendor.location      || dbVendor.city || '',
              responseRate: dbVendor.responseRate  || 100,
              hasGST:       dbVendor.hasGST        || false,
              hasEmail:     !!dbVendor.email,
              hasMobile:    !!dbVendor.phone,
              memberSince:  dbVendor.memberSince   || '',
              bulkPricing
            },
            isActive: true
          });
        }

        if (marketplaceDocs.length > 0) {
          await B2BMarketplaceProduct.insertMany(marketplaceDocs);
        }

        // ── 5. Upsert B2BCatalogProduct so the listing page shows it ────────────
        const prices = vendorPrices.length ? vendorPrices : [Number(row.price)];
        await B2BCatalogProduct.findOneAndUpdate(
          { productId: productIdStr },
          {
            $set: {
              productId:    productIdStr,
              productName:  productData.name,
              category:     row.category,
              categoryId:   categoryId.toString(),
              subcategoryId: subCategoryId.toString(),
              image:        '',
              vendorCount:  linkedVendors,
              priceRange:   { min: Math.min(...prices), max: Math.max(...prices) },
              unit:         row.unit || 'Kg',
              isActive:     true
            }
          },
          { upsert: true, new: true }
        );

        results.push({ productName: productData.name, success: true, vendorCount: linkedVendors, id: product._id });
      } catch (err) {
        failedCount++;
        const errMsg = err.code === 11000
          ? `Duplicate ${Object.keys(err.keyPattern)[0]}`
          : err.message;
        results.push({ productName: row.productName || row.name, success: false, vendorCount: 0, errors: [errMsg] });
      }
    }

    res.status(200).json({
      success: true,
      message: `${createdCount} product(s) created, ${failedCount} failed.`,
      data: { created: createdCount, failed: failedCount, results }
    });
  } catch (error) {
    console.error('Error in bulk create multi-vendor products:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk multi-vendor product upload',
      error: error.message
    });
  }
};
