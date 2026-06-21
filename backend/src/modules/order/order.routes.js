const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { protect } = require('../../middleware/auth');

// Customer routes (protected - require authentication)
router.post('/create', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/verify-payment', orderController.verifyPayment);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin routes (you can add admin middleware later)
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
