const User = require('../models/User.model');
const Item = require('../models/Item.model');
const Order = require('../models/Order.model');

// ─── USERS ────────────────────────────────────────────────────────────────────

// GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
};

// PUT /api/admin/users/:id  – update role or ban status
const updateUser = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

// GET /api/admin/products
const getProducts = async (req, res) => {
    try {
        const products = await Item.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products', error: err.message });
    }
};

// POST /api/admin/products
const createProduct = async (req, res) => {
    try {
        const product = new Item(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: 'Failed to create product', error: err.message });
    }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update product', error: err.message });
    }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Item.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete product', error: err.message });
    }
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────

// GET /api/admin/orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
    }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'username email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: 'Failed to update order status', error: err.message });
    }
};

// ─── STATS ────────────────────────────────────────────────────────────────────

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
            User.countDocuments(),
            Item.countDocuments(),
            Order.countDocuments(),
            Order.find().select('totalPrice status')
        ]);

        const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'pending').length;

        res.json({ totalUsers, totalProducts, totalOrders, revenue, pendingOrders });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
    }
};

module.exports = {
    getUsers, updateUser, deleteUser,
    getProducts, createProduct, updateProduct, deleteProduct,
    getAllOrders, updateOrderStatus,
    getStats
};
