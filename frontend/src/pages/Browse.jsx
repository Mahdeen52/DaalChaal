import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ItemsService, DecisionsService, OverthinkingService } from '../api/services';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

function Browse() {
    const { token } = useAuth();
    const { isInCart, addToCart, removeFromCart } = useCart();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [randomComments, setRandomComments] = useState({});

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await ItemsService.getAll();
                setItems(data);

                // Fetch random comments for each item's category
                const commentPromises = data.map(async (item) => {
                    const res = await OverthinkingService.getComment(item.category);
                    return { id: item._id, comment: res.comment };
                });

                const commentsResults = await Promise.all(commentPromises);
                const commentsMap = {};
                commentsResults.forEach(res => {
                    commentsMap[res.id] = res.comment;
                });
                setRandomComments(commentsMap);

            } catch (err) {
                console.error("Failed to fetch items or comments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [token]);

    const handleDecision = async (itemId, action) => {
        try {
            if (action === 'buy') {
                await addToCart(itemId);
            } else {
                await removeFromCart(itemId);
            }
            await DecisionsService.create(itemId, action);
            const feedbackMsg = action === 'buy' ? "Added to cart" : "Back to the shelf";
            setMessage({ text: feedbackMsg, type: action === 'buy' ? 'success' : 'neutral' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({
                text: err.response?.data?.message || "Decision failed",
                type: 'error'
            });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div style={styles.pageWrapper}>
            <Navbar />

            <div className="container" style={styles.container}>
                {/* Page Header */}
                <div className="page-header" style={styles.header}>
                    <span className="page-badge" style={styles.badge}>Premium Selection</span>
                    <h1 style={styles.title}>Our Products</h1>
                    <p style={styles.subtitle}>
                        Carefully curated items for the discerning shopper.
                        Every choice tells a story.
                    </p>
                </div>

                {/* Toast Message */}
                {message && (
                    <div style={{
                        ...styles.toast,
                        background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5',
                        color: message.type === 'error' ? '#B91C1C' : '#065F46',
                        border: `1px solid ${message.type === 'error' ? '#FECACA' : '#A7F3D0'}`
                    }}>
                        <span>{message.type === 'error' ? '!' : 'OK'}</span>
                        {message.text}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading premium products...</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {items.map((item, index) => (
                            <div
                                key={item._id}
                                className={`product-card fade-in stagger-${(index % 6) + 1}`}
                                style={{
                                    ...styles.productCard,
                                    animationDelay: `${index * 0.08}s`,
                                    ...(hoveredCard === item._id ? styles.productCardHover : {})
                                }}
                                onMouseEnter={() => setHoveredCard(item._id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Product Image */}
                                <div className="product-image-container" style={styles.imageContainer}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="product-image"
                                        style={styles.productImage}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80';
                                        }}
                                    />
                                    <div className="price-badge" style={styles.priceBadge}>
                                        Tk. {item.price}
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div style={styles.productInfo}>
                                    <h3 style={styles.productName}>{item.name}</h3>

                                    {item.comment && (
                                        <p style={styles.productComment}>"{item.comment}"</p>
                                    )}

                                    {/* Nutrition Info */}
                                    {item.nutritionInfo && (
                                        <div className="nutrition-box" style={styles.nutritionBox}>
                                            <div style={styles.nutritionHeader}>Nutrition Information</div>
                                            <div style={styles.nutritionGrid}>
                                                <div className="nutrition-item" style={styles.nutritionItem}>
                                                    <span style={styles.nutritionLabel}>Calorie</span>
                                                    <span style={styles.nutritionValue}>{item.nutritionInfo.calories}</span>
                                                </div>
                                                <div className="nutrition-item" style={styles.nutritionItem}>
                                                    <span style={styles.nutritionLabel}>Protein</span>
                                                    <span style={styles.nutritionValue}>{item.nutritionInfo.protein}</span>
                                                </div>
                                                <div className="nutrition-item" style={styles.nutritionItem}>
                                                    <span style={styles.nutritionLabel}>Carbs</span>
                                                    <span style={styles.nutritionValue}>{item.nutritionInfo.carbs}</span>
                                                </div>
                                                <div className="nutrition-item" style={styles.nutritionItem}>
                                                    <span style={styles.nutritionLabel}>Fat</span>
                                                    <span style={styles.nutritionValue}>{item.nutritionInfo.fat}</span>
                                                </div>
                                            </div>
                                            {item.nutritionJoke && (
                                                <div style={styles.nutritionJoke}>{item.nutritionJoke}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Overthinking Comment Box */}
                                    <div className="overthinking-box" style={styles.overthinkingBox}>
                                        <div style={styles.overthinkingHeader}>
                                            <span className="overthinking-icon" style={styles.overthinkingIcon}></span>
                                            <span style={styles.overthinkingLabel}>Overthinking Aspect</span>
                                        </div>
                                        <p style={styles.overthinkingText}>
                                            {randomComments[item._id] || item.overthinkingComment}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={styles.buttonGroup}>
                                        <button
                                            onClick={() => handleDecision(item._id, 'buy')}
                                            className="buy-button"
                                            style={styles.buyButton}
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleDecision(item._id, 'pass')}
                                            disabled={!isInCart(item._id)}
                                            className="pass-button"
                                            style={{
                                                ...styles.passButton,
                                                opacity: isInCart(item._id) ? 1 : 0.4,
                                                cursor: isInCart(item._id) ? 'pointer' : 'not-allowed',
                                                borderColor: isInCart(item._id) ? 'rgba(201, 162, 39, 0.5)' : 'rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            Pass
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f1a 100%)',
        position: 'relative',
        overflow: 'hidden'
    },
    container: {
        padding: '48px 24px 80px',
        position: 'relative',
        zIndex: 1
    },
    header: {
        textAlign: 'center',
        marginBottom: '56px'
    },
    badge: {
        display: 'inline-block',
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #C9A227 0%, #F5E6C8 50%, #C9A227 100%)',
        backgroundSize: '200% 200%',
        color: '#0f0f1a',
        borderRadius: '50px',
        fontWeight: '700',
        fontSize: '12px',
        marginBottom: '24px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        boxShadow: '0 8px 32px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
    },
    title: {
        fontSize: '52px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 50%, #FFFFFF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '20px',
        fontFamily: "'Playfair Display', serif",
        textShadow: '0 0 40px rgba(201, 162, 39, 0.3)'
    },
    subtitle: {
        fontSize: '18px',
        color: 'rgba(255, 255, 255, 0.6)',
        maxWidth: '550px',
        margin: '0 auto',
        lineHeight: '1.8',
        fontWeight: '300',
        letterSpacing: '0.5px'
    },
    toast: {
        position: 'fixed',
        top: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '18px 36px',
        borderRadius: '16px',
        zIndex: 200,
        fontWeight: '600',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '15px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '100px 0',
        color: 'rgba(255, 255, 255, 0.6)'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: '#C9A227',
        borderRadius: '50%',
        margin: '0 auto 20px',
        animation: 'spin 1s linear infinite'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '40px'
    },
    productCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.5),
            0 15px 60px rgba(0, 0, 0, 0.3),
            0 5px 20px rgba(201, 162, 39, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        perspective: '1000px'
    },
    productCardHover: {
        transform: 'translateY(-24px) scale(1.02)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        boxShadow: `
            0 0 0 2px rgba(255, 255, 255, 0.15),
            0 0 25px rgba(255, 255, 255, 0.2),
            0 0 50px rgba(255, 255, 255, 0.1),
            0 30px 60px rgba(0, 0, 0, 0.6),
            0 50px 100px rgba(0, 0, 0, 0.4),
            0 20px 50px rgba(201, 162, 39, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `
    },
    imageContainer: {
        height: '260px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), filter 0.4s ease, opacity 0.3s ease',
        willChange: 'transform'
    },
    priceBadge: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 50%, #C9A227 100%)',
        color: '#0f0f1a',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: '800',
        fontSize: '16px',
        boxShadow: '0 8px 25px rgba(201, 162, 39, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: '0.5px'
    },
    productInfo: {
        padding: '32px',
        background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.8) 0%, rgba(15, 15, 26, 0.95) 100%)'
    },
    productName: {
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#FFFFFF',
        fontFamily: "'Playfair Display', serif",
        letterSpacing: '0.5px'
    },
    productComment: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontStyle: 'italic',
        marginBottom: '20px',
        lineHeight: '1.6'
    },
    nutritionBox: {
        background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.15) 0%, rgba(76, 175, 80, 0.1) 100%)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(76, 175, 80, 0.2)',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)'
    },
    nutritionHeader: {
        fontWeight: '700',
        fontSize: '11px',
        color: '#81C784',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    nutritionGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
    },
    nutritionItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    nutritionLabel: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    nutritionValue: {
        fontSize: '14px',
        color: '#A5D6A7',
        fontWeight: '700'
    },
    nutritionJoke: {
        fontSize: '13px',
        color: 'rgba(165, 214, 167, 0.8)',
        fontStyle: 'italic',
        padding: '14px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        lineHeight: '1.7',
        borderLeft: '3px solid rgba(76, 175, 80, 0.5)'
    },
    overthinkingBox: {
        background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(232, 212, 138, 0.05) 100%)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(201, 162, 39, 0.15)',
        marginBottom: '28px',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
    },
    overthinkingHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '14px'
    },
    overthinkingIcon: {
        fontSize: '22px',
        filter: 'drop-shadow(0 0 8px rgba(201, 162, 39, 0.5))'
    },
    overthinkingLabel: {
        fontWeight: '700',
        fontSize: '11px',
        color: '#E8D48A',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    },
    overthinkingText: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: '1.8'
    },
    buttonGroup: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
    },
    buyButton: {
        padding: '16px',
        borderRadius: '14px',
        border: 'none',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 50%, #C9A227 100%)',
        backgroundSize: '200% 200%',
        color: '#0f0f1a',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
        boxShadow: '0 8px 30px rgba(201, 162, 39, 0.35), inset 0 2px 0 rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '1.5px'
    },
    passButton: {
        padding: '16px',
        borderRadius: '14px',
        border: '2px solid rgba(201, 162, 39, 0.5)',
        background: 'rgba(201, 162, 39, 0.05)',
        color: '#E8D48A',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: "'Poppins', sans-serif",
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        backdropFilter: 'blur(10px)'
    }
};

export default Browse;
