import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [isAuthenticated, token]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (itemId, quantity = 1) => {
        try {
            const res = await axios.post('http://localhost:5000/api/cart/add',
                { itemId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data.cart);
            return { success: true, message: res.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add to cart'
            };
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const res = await axios.post('http://localhost:5000/api/cart/remove',
                { itemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data.cart);
            return {
                success: true,
                message: res.data.message,
                overthinkingTriggered: res.data.overthinkingTriggered
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove from cart'
            };
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const res = await axios.put('http://localhost:5000/api/cart/update',
                { itemId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data.cart);
            return { success: true, message: res.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update cart'
            };
        }
    };

    const clearCart = async () => {
        try {
            const res = await axios.delete('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data.cart);
            return { success: true, message: res.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to clear cart'
            };
        }
    };

    const checkout = async ({ shippingAddress, customerName, phone, installmentPlan, installmentDetails, paymentMethod }) => {
        try {
            const res = await axios.post('http://localhost:5000/api/orders/checkout',
                { shippingAddress, customerName, phone, installmentPlan, installmentDetails, paymentMethod },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart({ items: [], totalPrice: 0 }); // Clear cart after checkout
            return { success: true, message: res.data.message, order: res.data.order };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Checkout failed'
            };
        }
    };

    const getCartItemCount = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    };

    const isInCart = (itemId) => {
        if (!cart || !cart.items) return false;
        return cart.items.some(item => item.item && item.item._id === itemId);
    };

    const value = {
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        checkout,
        fetchCart,
        getCartItemCount,
        isInCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
