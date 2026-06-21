const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const {
  getUserWishlist,
  addToWishlist,
  addBulkToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist
} = require('./wishlist.controller');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.post('/bulk', addBulkToWishlist);

router.route('/check/:productId')
  .get(checkWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

module.exports = router;
