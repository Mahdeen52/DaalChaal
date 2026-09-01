import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardService } from '../api/services';
import Navbar from '../components/Navbar';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await DashboardService.getStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, subtext, icon, accentColor, cardId }) => (
        <div
            style={{
                ...styles.statCard,
                ...(hoveredCard === cardId ? styles.statCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(cardId)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            <div style={styles.statHeader}>
                <span style={{ ...styles.statIcon, background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)` }}>{icon}</span>
                <h3 style={styles.statTitle}>{title}</h3>
            </div>
            <div style={{ ...styles.statValue, color: accentColor }}>
                {value}
            </div>
            <p style={styles.statSubtext}>{subtext}</p>
            <div style={{ ...styles.statGlow, background: `radial-gradient(circle at center, ${accentColor}20 0%, transparent 70%)` }}></div>
        </div>
    );

    return (
        <div style={styles.pageWrapper}>
            <Navbar />

            <div className="container" style={styles.container}>
                {/* Page Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Dashboard</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <p style={styles.subtitle}>Welcome back, {user?.username}. Here's your shopping analysis.</p>
                            {stats?.funnyTag && (
                                <span style={{
                                    ...styles.tagBadge,
                                    background: stats.overthinkingScore > 50 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(201, 162, 39, 0.15)',
                                    color: stats.overthinkingScore > 50 ? '#ef4444' : '#C9A227',
                                    border: `1px solid ${stats.overthinkingScore > 50 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(201, 162, 39, 0.3)'}`
                                }}>
                                    {stats.funnyTag}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={styles.dateBadge}>
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div style={styles.statsGrid}>
                            <StatCard
                                cardId="decisions"
                                title="Total Decisions"
                                value={stats?.decisionsMade || 0}
                                subtext="Items processed"
                                icon=""
                                accentColor="#C9A227"
                            />
                            <StatCard
                                cardId="hesitations"
                                title="Hesitation Count"
                                value={stats?.hesitationCount || 0}
                                subtext="Items returned to shelf"
                                icon=""
                                accentColor="#F59E0B"
                            />
                            <StatCard
                                cardId="paralysis"
                                title="Analysis Paralysis"
                                value={`${stats?.overthinkingScore || 0}%`}
                                subtext={stats?.overthinkingScore > 50 ? "High anxiety detected" : "Within normal limits"}
                                icon=""
                                accentColor={stats?.overthinkingScore > 50 ? "#DC2626" : "#059669"}
                            />
                        </div>

                        {/* Activity Log */}
                        <div style={styles.activityCard}>
                            <div style={styles.activityHeader}>
                                <h2 style={styles.activityTitle}>Recent Activity</h2>
                                <span style={styles.activityBadge}>
                                    {stats?.recentActivity?.length || 0} items
                                </span>
                            </div>

                            <div style={styles.activityList}>
                                {stats?.recentActivity?.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <span style={styles.emptyIcon}></span>
                                        <p>No recent activity found.</p>
                                        <p style={styles.emptySubtext}>Start shopping to see your decisions here!</p>
                                    </div>
                                ) : (
                                    stats?.recentActivity.map((activity) => (
                                        <div key={activity._id} style={styles.activityItem}>
                                            <div style={styles.activityImage}>
                                                <img
                                                    src={activity.item?.image}
                                                    alt=""
                                                    style={styles.itemImage}
                                                />
                                                <div style={{
                                                    ...styles.actionBadge,
                                                    background: activity.action === 'buy' ? '#10B981' : '#F59E0B'
                                                }}>
                                                    {activity.action === 'buy' ? '✓' : '↩'}
                                                </div>
                                            </div>

                                            <div style={styles.activityInfo}>
                                                <div style={styles.itemName}>{activity.item?.name}</div>
                                                <div style={styles.itemMeta}>
                                                    {activity.choice === 'buy' ? 'Added to cart' : 'Back to the shelf'}
                                                    <span style={styles.dot}>•</span>
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div style={{
                                                ...styles.itemPrice,
                                                color: activity.action === 'buy' ? '#C9A227' : '#999999'
                                            }}>
                                                Tk. {activity.item ? activity.item.price.toFixed(2) : '0.00'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f1a 100%)',
        position: 'relative'
    },
    container: {
        padding: '48px 24px 80px',
        position: 'relative',
        zIndex: 1
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '48px',
        paddingBottom: '28px',
        borderBottom: '1px solid rgba(201, 162, 39, 0.2)'
    },
    title: {
        fontSize: '42px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 50%, #E8D48A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '10px',
        fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '300'
    },
    dateBadge: {
        padding: '12px 20px',
        background: 'rgba(201, 162, 39, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        fontSize: '14px',
        color: '#E8D48A',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(201, 162, 39, 0.2)',
        fontWeight: '500'
    },
    tagBadge: {
        padding: '4px 12px',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        letterSpacing: '0.3px',
        marginTop: '-4px'
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '28px',
        marginBottom: '48px'
    },
    statCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 15px 60px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
    },
    statCardHover: {
        transform: 'translateY(-16px) scale(1.02)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.1),
            0 0 25px rgba(255, 255, 255, 0.15),
            0 0 50px rgba(255, 255, 255, 0.08),
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 40px 80px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15)
        `
    },
    statGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '200%',
        height: '200%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.5,
        pointerEvents: 'none'
    },
    statHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
    },
    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
    },
    statTitle: {
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#999999',
        letterSpacing: '0.5px',
        fontFamily: "'Poppins', sans-serif"
    },
    statValue: {
        fontSize: '42px',
        fontWeight: '700',
        lineHeight: 1,
        marginBottom: '8px',
        fontFamily: "'Poppins', sans-serif"
    },
    statSubtext: {
        fontSize: '14px',
        color: '#666666'
    },
    activityCard: {
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        border: '1px solid #E8E8E8',
        overflow: 'hidden'
    },
    activityHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #FFFEF7 0%, #F5E6C8 100%)',
        borderBottom: '1px solid rgba(201, 162, 39, 0.15)'
    },
    activityTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1A1A1A',
        fontFamily: "'Playfair Display', serif"
    },
    activityBadge: {
        padding: '6px 14px',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 100%)',
        borderRadius: '50px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#1A1A1A'
    },
    activityList: {
        maxHeight: '400px',
        overflowY: 'auto'
    },
    emptyState: {
        padding: '60px 20px',
        textAlign: 'center',
        color: '#999999'
    },
    emptyIcon: {
        fontSize: '40px',
        display: 'block',
        marginBottom: '16px'
    },
    emptySubtext: {
        fontSize: '13px',
        marginTop: '8px',
        color: '#BBBBBB'
    },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '20px 28px',
        borderBottom: '1px solid #F5F5F5',
        transition: 'background 0.2s ease'
    },
    activityImage: {
        width: '52px',
        height: '52px',
        marginRight: '20px',
        position: 'relative'
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        objectFit: 'cover'
    },
    actionBadge: {
        position: 'absolute',
        bottom: '-4px',
        right: '-4px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: 'white',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    activityInfo: {
        flex: 1
    },
    itemName: {
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: '4px',
        fontSize: '15px'
    },
    itemMeta: {
        fontSize: '13px',
        color: '#999999'
    },
    dot: {
        margin: '0 6px'
    },
    itemPrice: {
        fontWeight: '700',
        fontSize: '15px'
    }
};

export default Dashboard;
