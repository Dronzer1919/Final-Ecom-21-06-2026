const express = require('express');
const router  = express.Router();
const ctrl    = require('./b2b.controller');

// Full catalog (one-shot for frontend init)
router.get('/catalog', ctrl.getFullCatalog);

// Sections
router.get('/sections',            ctrl.getAllSections);
router.get('/sections/:sectionId', ctrl.getSectionById);

// Categories
router.get('/categories',              ctrl.getAllCategories);
router.get('/categories/:categoryId',  ctrl.getCategoryById);

// Catalog products (flat listing)
router.get('/products',               ctrl.getCatalogProducts);
router.get('/products/:productId',    ctrl.getCatalogProductById);

// Marketplace listings (all suppliers for a product)
router.get('/marketplace/:productId', ctrl.getMarketplaceListings);

module.exports = router;
