import React from 'react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const { cart, loading, updateCartItem, removeFromCart, getCartItemCount } = useCart();
    const navigate = useNavigate();

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        await updateCartItem(itemId, newQuantity);
    };

    const handleRemove = async (itemId) => {
        await removeFromCart(itemId);
    };

    const handleCheckout = () => {
        navigate('/billing');
    };

    if (loading && !cart) {
        return (
            <div style={styles.pageWrapper}>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Fetching your overthinking selections...</p>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];

    return (
        <div style={styles.pageWrapper}>
            <Navbar />
            <div className="container" style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Your Cart</h1>
                    <p style={styles.subtitle}>
                        {items.length > 0
                            ? `You've selected ${getCartItemCount()} items. Are you absolutely sure about each one?`
                            : "Your cart is empty. Or is it just waiting for the perfect choice?"}
                    </p>
                </div>

                {items.length > 0 ? (
                    <div style={styles.cartContent}>
                        <div style={styles.itemsList}>
                            {items.map((cartItem) => (
                                <div key={cartItem.item?._id} style={styles.cartItem}>
                                    <img
                                        src={cartItem.item?.image}
                                        alt={cartItem.item?.name}
                                        style={styles.itemImage}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80';
                                        }}
                                    />
                                    <div style={styles.itemInfo}>
                                        <h3 style={styles.itemName}>{cartItem.item?.name}</h3>
                                        <p style={styles.itemCategory}>{cartItem.item?.category}</p>
                                        <p style={styles.itemPrice}>Tk. {cartItem.item?.price}</p>
                                    </div>
                                    <div style={styles.itemActions}>
                                        <div style={styles.quantityControls}>
                                            <button
                                                onClick={() => handleQuantityChange(cartItem.item?._id, cartItem.quantity - 1)}
                                                style={styles.qtyBtn}
                                            >-</button>
                                            <span style={styles.quantity}>{cartItem.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(cartItem.item?._id, cartItem.quantity + 1)}
                                                style={styles.qtyBtn}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(cartItem.item?._id)}
                                            style={styles.removeBtn}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={styles.summaryCard}>
                            <h2 style={styles.summaryTitle}>Order Summary</h2>
                            <div style={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>Tk. {cart.totalPrice}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Overthinking Tax</span>
                                <span style={{ color: '#C9A227' }}>Tk. 0 (For now...)</span>
                            </div>
                            <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                                <span>Total</span>
                                <span>Tk. {cart.totalPrice}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                style={styles.checkoutBtn}
                            >
                                Proceed to Checkout
                            </button>
                            <button
                                onClick={() => navigate('/browse')}
                                style={styles.continueBtn}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}></div>
                        <button
                            onClick={() => navigate('/browse')}
                            style={styles.checkoutBtn}
                        >
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        color: '#fff'
    },
    container: {
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px'
    },
    title: {
        fontSize: '42px',
        fontFamily: "'Playfair Display', serif",
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '18px'
    },
    cartContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '40px',
        alignItems: 'start'
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    cartItem: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        transition: 'all 0.3s ease'
    },
    itemImage: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '12px'
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        fontSize: '20px',
        marginBottom: '4px'
    },
    itemCategory: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '8px'
    },
    itemPrice: {
        fontSize: '18px',
        color: '#C9A227',
        fontWeight: 'bold'
    },
    itemActions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px'
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'rgba(255,255,255,0.05)',
        padding: '5px 15px',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    qtyBtn: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '0 5px'
    },
    quantity: {
        fontSize: '16px',
        fontWeight: 'bold',
        minWidth: '20px',
        textAlign: 'center'
    },
    removeBtn: {
        background: 'none',
        border: 'none',
        color: '#ff4d4d',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontSize: '14px'
    },
    summaryCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    },
    summaryTitle: {
        fontSize: '24px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '16px'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        fontSize: '16px',
        color: 'rgba(255,255,255,0.8)'
    },
    totalRow: {
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#fff'
    },
    checkoutBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 100%)',
        color: '#0f0f1a',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '24px',
        transition: 'transform 0.2s ease'
    },
    continueBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'none',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '12px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 0'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '100px 0'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255,255,255,0.1)',
        borderTopColor: '#C9A227',
        borderRadius: '50%',
        margin: '0 auto 20px',
        animation: 'spin 1s linear infinite'
    }
};

export default Cart;
