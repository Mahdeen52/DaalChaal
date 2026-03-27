import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, user: authUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && authUser) {
            navigate(authUser.role === 'admin' ? '/admin' : '/browse');
        }
    }, [isAuthenticated, authUser, navigate]);

    // Hardcoded admin credentials (for demo/dev)
    const ADMIN_EMAIL = 'admin@dalchaal.com';
    const ADMIN_PASSWORD = 'Admin@1234';

    const fillAdmin = () => setFormData({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate(result.role === 'admin' ? '/admin' : '/browse');
        } else {
            setError(result.message || 'Login failed');
        }
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Decorative Background Elements */}
            <div style={styles.bgPattern}></div>
            <div style={styles.goldAccent1}></div>
            <div style={styles.goldAccent2}></div>

            {/* Header/Logo Area */}
            <header style={styles.header}>
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}></span>
                    <span style={styles.logoText}>DalChaal</span>
                </Link>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <div className="fade-in" style={styles.card}>
                    {/* Card Header */}
                    <div style={styles.cardHeader}>
                        <h1 style={styles.title}>Welcome Back</h1>
                        <p style={styles.subtitle}>Sign in to continue shopping</p>
                    </div>

                    {/* Gold Divider */}
                    <div style={styles.divider}></div>

                    {/* Admin Hint */}
                    <div
                        style={styles.adminHint}
                        onClick={fillAdmin}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(201, 162, 39, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(201, 162, 39, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(201, 162, 39, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(201, 162, 39, 0.3)';
                        }}
                    >
                        <div style={styles.adminHintTitle}>
                            <span style={styles.adminHintIcon}>🛡️</span>
                            Admin Access
                        </div>
                        <div style={styles.adminHintBody}>
                            Click here to auto-fill admin credentials
                        </div>
                        <div style={styles.adminHintCreds}>
                            {ADMIN_EMAIL} / {ADMIN_PASSWORD}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorIcon}>!</span>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={onSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="Enter your email"
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Enter your password"
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.rememberRow}>
                            <label style={styles.checkboxLabel}>
                                <input type="checkbox" style={styles.checkbox} />
                                <span>Remember me</span>
                            </label>
                            <span style={styles.forgotLink}>Forgot password?</span>
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <span style={styles.footerText}>New to DalChaal?</span>
                        <Link to="/register" style={styles.registerLink}>
                            Create an account
                        </Link>
                    </div>
                </div>
            </main>

            {/* Bottom Tagline */}
            <footer style={styles.tagline}>
                <p>Premium Shopping Experience • Where Every Choice Matters</p>
            </footer>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0f0f1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
    },
    bgPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201, 162, 39, 0.05) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(201, 162, 39, 0.08) 0%, transparent 40%),
                          radial-gradient(circle at 40% 80%, rgba(201, 162, 39, 0.05) 0%, transparent 40%)`,
        pointerEvents: 'none'
    },
    goldAccent1: {
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
    },
    goldAccent2: {
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(201, 162, 39, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
    },
    header: {
        padding: '24px 40px',
        position: 'relative',
        zIndex: 10
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none'
    },
    logoIcon: {
        fontSize: '36px'
    },
    logoText: {
        fontSize: '24px',
        fontWeight: '700',
        fontFamily: "'Playfair Display', serif",
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 50%, #E8D48A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '-0.5px'
    },
    main: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        zIndex: 10
    },
    card: {
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 15px 60px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
        border: '1px solid rgba(255, 255, 255, 0.08)'
    },
    cardHeader: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 50%, #E8D48A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '8px',
        fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
        fontSize: '15px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '400'
    },
    divider: {
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #C9A227, transparent)',
        marginBottom: '32px'
    },
    adminHint: {
        background: 'rgba(201, 162, 39, 0.08)',
        border: '1px dashed rgba(201, 162, 39, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center'
    },
    adminHintTitle: {
        color: '#E8D48A',
        fontSize: '14px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '4px'
    },
    adminHintIcon: {
        fontSize: '16px'
    },
    adminHintBody: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px',
        marginBottom: '4px'
    },
    adminHintCreds: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '13px',
        fontFamily: "'Courier New', monospace"
    },
    errorBox: {
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        color: '#FECACA',
        padding: '14px 18px',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    errorIcon: {
        fontSize: '16px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)'
    },
    input: {
        width: '100%',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '15px',
        fontFamily: "'Poppins', sans-serif",
        transition: 'all 0.3s ease',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box'
    },
    rememberRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '4px'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer'
    },
    checkbox: {
        width: '18px',
        height: '18px',
        accentColor: '#C9A227',
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    forgotLink: {
        fontSize: '14px',
        color: '#E8D48A',
        fontWeight: '500',
        cursor: 'pointer'
    },
    button: {
        width: '100%',
        padding: '18px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 50%, #C9A227 100%)',
        color: '#0f0f1a',
        fontSize: '16px',
        fontWeight: '700',
        fontFamily: "'Poppins', sans-serif",
        cursor: 'pointer',
        marginTop: '8px',
        boxShadow: '0 8px 25px rgba(201, 162, 39, 0.3)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '1.5px'
    },
    footer: {
        marginTop: '32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    footerText: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)'
    },
    registerLink: {
        fontSize: '15px',
        color: '#E8D48A',
        fontWeight: '600',
        textDecoration: 'none'
    },
    tagline: {
        padding: '24px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: '13px',
        position: 'relative',
        zIndex: 10
    }
};

export default Login;
