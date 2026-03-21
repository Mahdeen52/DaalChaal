import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

// Installment plan definitions — update logic here when user provides details
const INSTALLMENT_PLANS = {
    A: {
        label: 'Plan A - Pay Now',
        tagline: 'One and done.',
        description: 'Pay the full amount today. Simple, instant, complete.',
        color: '#4CAF50',
        compute: (total) => [
            { installmentNumber: 1, label: 'Full Payment (Today)', amount: total, dueDate: 'Due Now' }
        ]
    },
    B: {
        label: 'Plan B - Split in 2',
        tagline: 'Half now, half next month.',
        description: 'Pay 50% today and the remaining 50% in 30 days.',
        color: '#2196F3',
        compute: (total) => [
            { installmentNumber: 1, label: '1st Payment (Today)', amount: +(total * 0.5).toFixed(2), dueDate: 'Due Now' },
            { installmentNumber: 2, label: '2nd Payment', amount: +(total * 0.5).toFixed(2), dueDate: 'Due in 30 days' }
        ]
    },
    C: {
        label: 'Plan C - 3 Months',
        tagline: 'A third now, relax for 2 months.',
        description: 'Pay ~33% now, then 2 equal monthly installments.',
        color: '#FF9800',
        compute: (total) => {
            const each = +(total / 3).toFixed(2);
            const last = +(total - each * 2).toFixed(2);
            return [
                { installmentNumber: 1, label: '1st Payment (Today)', amount: each, dueDate: 'Due Now' },
                { installmentNumber: 2, label: '2nd Payment', amount: each, dueDate: 'Due in 30 days' },
                { installmentNumber: 3, label: '3rd Payment', amount: last, dueDate: 'Due in 60 days' }
            ];
        }
    },
    D: {
        label: 'Plan D - 4 Months',
        tagline: 'Quarter now, chill for 3 months.',
        description: 'Pay 25% today, then 3 more monthly installments.',
        color: '#9C27B0',
        compute: (total) => {
            const each = +(total / 4).toFixed(2);
            const last = +(total - each * 3).toFixed(2);
            return [
                { installmentNumber: 1, label: '1st Payment (Today)', amount: each, dueDate: 'Due Now' },
                { installmentNumber: 2, label: '2nd Payment', amount: each, dueDate: 'Due in 30 days' },
                { installmentNumber: 3, label: '3rd Payment', amount: each, dueDate: 'Due in 60 days' },
                { installmentNumber: 4, label: '4th Payment', amount: last, dueDate: 'Due in 90 days' }
            ];
        }
    }
};

function Billing() {
    const navigate = useNavigate();
    const { cart } = useCart();
    const [selectedPlan, setSelectedPlan] = useState('A');
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Bangladesh'
    });
    const [errors, setErrors] = useState({});

    const total = cart?.totalPrice || 0;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!form.street.trim()) newErrors.street = 'Street address is required';
        if (!form.city.trim()) newErrors.city = 'City is required';
        return newErrors;
    };

    const handleContinue = () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const plan = INSTALLMENT_PLANS[selectedPlan];
        const installmentDetails = plan.compute(total);

        navigate('/confirm', {
            state: {
                billingInfo: {
                    customerName: form.fullName,
                    phone: form.phone,
                    shippingAddress: {
                        street: form.street,
                        city: form.city,
                        state: form.state,
                        zipCode: form.zipCode,
                        country: form.country
                    },
                    installmentPlan: selectedPlan,
                    installmentDetails,
                    planLabel: plan.label
                },
                cart
            }
        });
    };

    return (
        <div style={styles.pageWrapper}>
            <Navbar />
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.stepBar}>
                        <div style={styles.stepActive}>1 - Billing Info</div>
                        <div style={styles.stepDivider}>&rarr;</div>
                        <div style={styles.stepInactive}>2 - Confirm Order</div>
                        <div style={styles.stepDivider}>&rarr;</div>
                        <div style={styles.stepInactive}>3 - Done</div>
                    </div>
                    <h1 style={styles.title}>Billing Information</h1>
                    <p style={styles.subtitle}>Fill in your details and choose a payment plan</p>
                </div>

                <div style={styles.twoCol}>
                    {/* Left: Customer Form */}
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Your Details</h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <input
                                id="billing-fullName"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="e.g. Mahdeen Ahmed"
                                style={{ ...styles.input, ...(errors.fullName ? styles.inputError : {}) }}
                            />
                            {errors.fullName && <span style={styles.error}>{errors.fullName}</span>}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number *</label>
                            <input
                                id="billing-phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+880 1700-000000"
                                style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                            />
                            {errors.phone && <span style={styles.error}>{errors.phone}</span>}
                        </div>

                        <h3 style={{ ...styles.cardTitle, fontSize: '16px', marginTop: '24px' }}>Delivery Address</h3>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Street Address *</label>
                            <input
                                id="billing-street"
                                name="street"
                                value={form.street}
                                onChange={handleChange}
                                placeholder="House/Road/Block"
                                style={{ ...styles.input, ...(errors.street ? styles.inputError : {}) }}
                            />
                            {errors.street && <span style={styles.error}>{errors.street}</span>}
                        </div>

                        <div style={styles.row}>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>City *</label>
                                <input
                                    id="billing-city"
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="Dhaka"
                                    style={{ ...styles.input, ...(errors.city ? styles.inputError : {}) }}
                                />
                                {errors.city && <span style={styles.error}>{errors.city}</span>}
                            </div>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>State / Division</label>
                                <input
                                    id="billing-state"
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="Dhaka Division"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>ZIP/Postal Code</label>
                                <input
                                    id="billing-zip"
                                    name="zipCode"
                                    value={form.zipCode}
                                    onChange={handleChange}
                                    placeholder="1207"
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>Country</label>
                                <input
                                    id="billing-country"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Plan Selector + Summary */}
                    <div style={styles.rightCol}>
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Payment Plan</h2>
                            <div style={styles.planGrid}>
                                {Object.entries(INSTALLMENT_PLANS).map(([key, plan]) => {
                                    const isSelected = selectedPlan === key;
                                    const preview = plan.compute(total);
                                    return (
                                        <div
                                            key={key}
                                            id={`plan-${key}`}
                                            onClick={() => setSelectedPlan(key)}
                                            style={{
                                                ...styles.planCard,
                                                border: isSelected
                                                    ? `2px solid ${plan.color}`
                                                    : '2px solid rgba(255,255,255,0.08)',
                                                background: isSelected
                                                    ? `linear-gradient(135deg, ${plan.color}18, ${plan.color}08)`
                                                    : 'rgba(255,255,255,0.03)',
                                                boxShadow: isSelected ? `0 0 20px ${plan.color}30` : 'none'
                                            }}
                                        >
                                            <div style={styles.planHeader}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ ...styles.planLabel, color: isSelected ? plan.color : '#fff' }}>
                                                        {plan.label}
                                                    </div>
                                                    <div style={styles.planTagline}>{plan.tagline}</div>
                                                </div>
                                                <div style={{
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    border: `2px solid ${isSelected ? plan.color : 'rgba(255,255,255,0.3)'}`,
                                                    background: isSelected ? plan.color : 'transparent',
                                                    transition: 'all 0.2s'
                                                }} />
                                            </div>
                                            <p style={styles.planDesc}>{plan.description}</p>
                                            {isSelected && (
                                                <div style={styles.planBreakdown}>
                                                    {preview.map((inst) => (
                                                        <div key={inst.installmentNumber} style={styles.installmentRow}>
                                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                                                {inst.label}
                                                            </span>
                                                            <span style={{ color: plan.color, fontWeight: 700, fontSize: '13px' }}>
                                                                Tk. {inst.amount} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>({inst.dueDate})</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mini Summary */}
                        <div style={{ ...styles.card, marginTop: '20px' }}>
                            <h2 style={styles.cardTitle}>Order Summary</h2>
                            <div style={styles.summaryRow}>
                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Items</span>
                                <span>{cart?.items?.length || 0}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Total</span>
                                <span style={{ color: '#C9A227', fontWeight: 700, fontSize: '20px' }}>Tk. {total}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Payment Plan</span>
                                <span style={{ color: INSTALLMENT_PLANS[selectedPlan].color, fontWeight: 600 }}>
                                    Plan {selectedPlan}
                                </span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Due Today</span>
                                <span style={{ color: '#fff', fontWeight: 700 }}>
                                    Tk. {INSTALLMENT_PLANS[selectedPlan].compute(total)[0]?.amount}
                                </span>
                            </div>
                        </div>

                        <button
                            id="billing-continue-btn"
                            onClick={handleContinue}
                            style={styles.continueBtn}
                            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            Continue to Confirmation →
                        </button>

                        <button
                            onClick={() => navigate('/cart')}
                            style={styles.backBtn}
                        >
                            ← Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        color: '#fff',
        fontFamily: "'Inter', sans-serif"
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px'
    },
    stepBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        fontSize: '14px'
    },
    stepActive: {
        background: 'linear-gradient(135deg, #C9A227, #E8D48A)',
        color: '#0f0f1a',
        padding: '6px 16px',
        borderRadius: '20px',
        fontWeight: 700
    },
    stepInactive: {
        color: 'rgba(255,255,255,0.3)',
        padding: '6px 16px'
    },
    stepDivider: {
        color: 'rgba(255,255,255,0.2)'
    },
    title: {
        fontSize: '38px',
        fontFamily: "'Playfair Display', serif",
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
    },
    subtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '16px'
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gap: '30px',
        alignItems: 'start'
    },
    card: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '28px',
        backdropFilter: 'blur(10px)'
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '20px',
        color: '#fff'
    },
    formGroup: {
        marginBottom: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box'
    },
    inputError: {
        borderColor: '#ff4d4d'
    },
    error: {
        color: '#ff4d4d',
        fontSize: '12px'
    },
    row: {
        display: 'flex',
        gap: '16px'
    },
    rightCol: {
        display: 'flex',
        flexDirection: 'column'
    },
    planGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    planCard: {
        padding: '16px',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.25s ease'
    },
    planHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '8px'
    },
    planBadge: {
        fontSize: '20px',
        lineHeight: '1'
    },
    planLabel: {
        fontSize: '15px',
        fontWeight: 700,
        transition: 'color 0.2s'
    },
    planTagline: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.45)',
        marginTop: '2px'
    },
    planDesc: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.55)',
        margin: '0 0 0 32px'
    },
    planBreakdown: {
        marginTop: '12px',
        marginLeft: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '10px'
    },
    installmentRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
        fontSize: '15px'
    },
    continueBtn: {
        marginTop: '20px',
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 100%)',
        color: '#0f0f1a',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 20px rgba(201, 162, 39, 0.4)'
    },
    backBtn: {
        width: '100%',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'transparent',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '10px'
    }
};

export default Billing;
