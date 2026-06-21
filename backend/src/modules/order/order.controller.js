const Order = require('./order.model');
const { successResponse, errorResponse } = require('../../utils/responseHandler');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay (you'll need to add your credentials)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
});

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Extract userId from request body (send from frontend)
    // In production, you should use authenticated user: req.user?.userId
    if (!orderData.userId) {
      return errorResponse(res, 400, 'User ID is required');
    }

    // If online payment, create Razorpay order
    if (orderData.paymentMethod === 'online') {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(orderData.total * 100), // Amount in paise
          currency: 'INR',
          receipt: `order_${Date.now()}`,
        });

        orderData.razorpayOrderId = razorpayOrder.id;
      } catch (razorpayError) {
        console.error('Razorpay order creation error:', razorpayError);
        // Continue with order creation even if Razorpay fails
        // Payment can be handled manually or retried
      }
    }

    const order = new Order(orderData);
    await order.save();

    return successResponse(res, 201, 'Order created successfully', order);
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', error.message);
    return errorResponse(res, 500, error.message || 'Failed to create order');
  }
};

// Get user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return errorResponse(res, 400, 'User ID is required');
    }
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Orders fetched successfully', orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    return successResponse(res, 200, 'Order fetched successfully', order);
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 500, 'Failed to fetch order');
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Update order as failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });
      return errorResponse(res, 400, 'Payment verification failed');
    }

    // Update order as completed
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
        razorpayPaymentId,
        razorpaySignature
      },
      { new: true }
    );

    return successResponse(res, 200, 'Payment verified successfully', order);
  } catch (error) {
    console.error('Verify payment error:', error);
    return errorResponse(res, 500, 'Failed to verify payment');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus, notes },
      { new: true, runValidators: true }
    );

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    return successResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 500, 'Failed to update order status');
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    // Only allow cancellation if order is not shipped or delivered
    if (['shipped', 'delivered'].includes(order.orderStatus)) {
      return errorResponse(res, 400, 'Cannot cancel shipped or delivered orders');
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return successResponse(res, 200, 'Order cancelled successfully', order);
  } catch (error) {
    console.error('Cancel order error:', error);
    return errorResponse(res, 500, 'Failed to cancel order');
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query['shippingAddress.fullName'] = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    return successResponse(res, 200, 'Orders fetched successfully', {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return errorResponse(res, 500, 'Failed to fetch orders');
  }
};
