import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { OverthinkingService } from '../api/services';
import { useCart } from '../context/CartContext';

function ShoppingAssistant() {
    const [insight, setInsight] = useState("Your smart shopping assistant. Let's analyze your choices...");
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [analyzingItem, setAnalyzingItem] = useState(null);
    const [lastIndex, setLastIndex] = useState(-1);
    const { cart } = useCart();

    const getNewInsight = async () => {
        setLoading(true);
        setIsAnimating(false);
        try {
            let category = 'Budget';
            let itemName = null;

            if (cart && cart.items && cart.items.length > 0) {
                // Improved randomization: try to pick an index different from the last one
                let newIndex = Math.floor(Math.random() * cart.items.length);
                if (cart.items.length > 1 && newIndex === lastIndex) {
                    newIndex = (newIndex + 1) % cart.items.length;
                }
                setLastIndex(newIndex);

                const selectedItem = cart.items[newIndex];
                category = selectedItem.item.category || 'Grocery';
                itemName = selectedItem.item.name || 'Selection';
                setAnalyzingItem(itemName);
            } else {
                setAnalyzingItem(null);
            }

            const res = await OverthinkingService.getComment(category, itemName);

            setTimeout(() => {
                setInsight(res.comment);
                setIsAnimating(true);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error("Failed to get insight:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsAnimating(true);
    }, []);

    return (
        <div style={styles.pageWrapper}>
            <Navbar />

            <div className="container" style={styles.container}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Shopping Assistant</h1>
                        <p style={styles.subtitle}>Smarter shopping decisions with real-time product insights.</p>
                    </div>

                    <div style={styles.insightSection}>
                        {/* Analytical Pulse */}
                        <div style={styles.pulseContainer}>
                            <div style={{
                                ...styles.pulse,
                                animation: loading ? 'pulse-gold 1.5s infinite' : 'none'
                            }}></div>
                            <div style={styles.core}>
                                <span style={styles.coreIcon}></span>
                            </div>
                        </div>

                        {/* Insight Card */}
                        <div style={{
                            ...styles.insightCard,
                            opacity: isAnimating ? 1 : 0,
                            transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                        }}>
                            <div style={styles.cardHeader}>
                                <span style={styles.aiTag}>
                                    {loading ? "ANALYZING..." : analyzingItem ? `CRITIQUE: ${analyzingItem.toUpperCase()}` : "SMART INSIGHT"}
                                </span>
                                {loading && <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>}
                            </div>
                            <div style={styles.insightText}>
                                {loading ? "Analyzing your basket..." : insight}
                            </div>
                            <div style={styles.cardDecoration}></div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={getNewInsight}
                            style={styles.actionBtn}
                            disabled={loading}
                        >
                            {loading ? "Analyzing..." : "Analyze My Choices"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse-gold {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(201, 162, 39, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(201, 162, 39, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(201, 162, 39, 0); }
                }
                .loading-dots span {
                    animation: blink 1.4s infinite both;
                    font-size: 24px;
                    color: #C9A227;
                }
                .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
                @keyframes blink {
                    0% { opacity: .2; }
                    20% { opacity: 1; }
                    100% { opacity: .2; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        color: '#fff',
    },
    container: {
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    content: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '60px'
    },
    header: {
        textAlign: 'center'
    },
    title: {
        fontSize: '56px',
        fontFamily: "'Playfair Display', serif",
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px',
        letterSpacing: '-1px'
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '20px',
        maxWidth: '700px',
        margin: '0 auto',
        fontFamily: "'Poppins', sans-serif"
    },
    insightSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '50px',
        width: '100%',
        maxWidth: '800px'
    },
    pulseContainer: {
        position: 'relative',
        width: '120px',
        height: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pulse: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '3px solid rgba(201, 162, 39, 0.5)',
    },
    core: {
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid rgba(201, 162, 39, 0.3)',
        zIndex: 2,
        boxShadow: '0 0 30px rgba(201, 162, 39, 0.2)'
    },
    coreIcon: {
        fontSize: '32px'
    },
    insightCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201, 162, 39, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        position: 'relative',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
    },
    aiTag: {
        background: 'rgba(201, 162, 39, 0.15)',
        color: '#C9A227',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '2px',
        border: '1px solid rgba(201, 162, 39, 0.3)'
    },
    insightText: {
        fontSize: '26px',
        fontWeight: '300',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: '1.6',
        color: '#FFFFFF',
        fontFamily: "'Playfair Display', serif"
    },
    cardDecoration: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle at bottom right, rgba(201, 162, 39, 0.1), transparent 70%)',
    },
    actionBtn: {
        padding: '20px 45px',
        borderRadius: '16px',
        border: 'none',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 50%, #C9A227 100%)',
        color: '#0f0f1a',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 15px 35px rgba(201, 162, 39, 0.3)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    }
};

export default ShoppingAssistant;
