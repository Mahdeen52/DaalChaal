const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const User = require('../models/User.model');

// @desc    Create order from cart (checkout)
// @route   POST /api/orders/checkout
// @access  Private
const checkout = async (req, res) => {
    try {
        const {
            shippingAddress,
            customerName,
            phone,
            installmentPlan,
            installmentDetails,
            paymentMethod
        } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.item');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Create order items with snapshot of current data
        const orderItems = cart.items.map(cartItem => ({
            item: cartItem.item._id,
            name: cartItem.item.name,
            price: cartItem.item.price,
            quantity: cartItem.quantity
        }));

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalPrice: cart.totalPrice,
            status: 'completed',
            paymentMethod: paymentMethod || 'simulated',
            customerName: customerName || '',
            phone: phone || '',
            installmentPlan: installmentPlan || 'A',
            installmentDetails: installmentDetails || [],
            shippingAddress: shippingAddress || {
                street: '123 Overthinking Ave',
                city: 'Decision City',
                state: 'Anxiety',
                zipCode: '12345',
                country: 'Mindland'
            }
        });

        // Update user stats - increment decisions made for each item purchased
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'stats.decisionsMade': cart.items.length }
        });

        // Clear cart after successful order
        cart.items = [];
        await cart.save();

        await order.populate('items.item');

        res.status(201).json({
            message: 'Order placed successfully!',
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get user's order history
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.item')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.item');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Make sure order belongs to user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    checkout,
    getOrders,
    getOrderById
};
