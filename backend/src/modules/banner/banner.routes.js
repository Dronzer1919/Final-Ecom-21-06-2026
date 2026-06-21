const express = require('express');
const router = express.Router();
const bannerController = require('./banner.controller');
const { 
  createBannerValidation, 
  updateBannerValidation, 
  bannerIdValidation 
} = require('./banner.middleware');
const validate = require('../../middleware/validate');
// const { authenticate, authorize } = require('../../middleware/auth');

// Public routes
router.get('/active', bannerController.getActiveBanners);
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerIdValidation, validate, bannerController.getBannerById);

// Protected routes (admin only) - uncomment when auth is ready
// router.use(authenticate);
// router.use(authorize('admin'));

router.post('/create', createBannerValidation, validate, bannerController.createBanner);
router.put('/:id', updateBannerValidation, validate, bannerController.updateBanner);
router.delete('/:id', bannerIdValidation, validate, bannerController.deleteBanner);

module.exports = router;
