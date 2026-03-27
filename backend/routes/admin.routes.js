const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
    getUsers, updateUser, deleteUser,
    getProducts, createProduct, updateProduct, deleteProduct,
    getAllOrders, updateOrderStatus,
    getStats
} = require('../controllers/adminController');

// Admin middleware – only allow users with role === 'admin'
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Stats
router.get('/stats', authMiddleware, adminOnly, getStats);

// Users
router.get('/users', authMiddleware, adminOnly, getUsers);
router.put('/users/:id', authMiddleware, adminOnly, updateUser);
router.delete('/users/:id', authMiddleware, adminOnly, deleteUser);

// Products
router.get('/products', authMiddleware, adminOnly, getProducts);
router.post('/products', authMiddleware, adminOnly, createProduct);
router.put('/products/:id', authMiddleware, adminOnly, updateProduct);
router.delete('/products/:id', authMiddleware, adminOnly, deleteProduct);

// Orders
router.get('/orders', authMiddleware, adminOnly, getAllOrders);
router.put('/orders/:id/status', authMiddleware, adminOnly, updateOrderStatus);

module.exports = router;
