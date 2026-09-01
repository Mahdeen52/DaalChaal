import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const PLAN_COLORS = { A: '#4CAF50', B: '#2196F3', C: '#FF9800', D: '#9C27B0' };

const PAYMENT_METHODS = [
    {
        id: 'cash_on_delivery',
        label: 'Cash on Delivery',
        description: 'Pay in cash when your order arrives'
    },
    {
        id: 'bank_transfer',
        label: 'Bank Transfer',
        description: 'Transfer directly to our bank account before delivery'
    },
    {
        id: 'bkash',
        label: 'bKash',
        description: 'Send payment to our bKash account before delivery'
    },
    {
        id: 'nagad',
        label: 'Nagad',
        description: 'Send payment to our Nagad account before delivery'
    },
    {
        id: 'rocket',
        label: 'Rocket',
        description: 'Dutch-Bangla Bank Mobile Banking'
    }
];

function OrderConfirmation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { checkout, cart } = useCart();
    const [isPlacing, setIsPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash_on_delivery');
    // Snapshot cart items before checkout clears the cart
    const [savedItems] = useState(() => cart?.items || []);
    const [savedTotal] = useState(() => cart?.totalPrice || 0);

    // Mock Payment Dashboard state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentPhone, setPaymentPhone] = useState('');
    const [paymentPin, setPaymentPin] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const state = location.state;
    const billing = state?.billingInfo;

    if (!billing) {
        return (
            <div style={styles.pageWrapper}>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
                        No billing information found.
                    </p>
                    <button onClick={() => navigate('/cart')} style={styles.primaryBtn}>
                        Go Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    const items = savedItems;
    const total = savedTotal;
    const planColor = PLAN_COLORS[billing.installmentPlan] || '#C9A227';

    const handlePlaceOrderClick = () => {
        if (selectedPaymentMethod === 'cash_on_delivery') {
            executeCheckout();
        } else {
            setIsPaymentModalOpen(true);
        }
    };

    const handleMockPaymentConfirm = async (e) => {
        e.preventDefault();

        // Basic presence check
        if (!paymentPhone || !paymentPin) {
            alert('Please enter your details');
            return;
        }

        // Specific Validations
        if (selectedPaymentMethod === 'bank_transfer') {
            // Bank Transfer: Numeric only
            if (!/^\d+$/.test(paymentPhone)) {
                alert('Invalid Account Number. Please enter digits only (no letters or symbols).');
                return;
            }
        } else {
            // Mobile Banking: Valid Bangladeshi Phone Number (starts with 01, 11 digits)
            const bdPhoneRegex = /^01[3-9]\d{8}$/;
            if (!bdPhoneRegex.test(paymentPhone)) {
                alert('Invalid Bangladeshi Phone Number. Must be 11 digits starting with 01.');
                return;
            }
        }

        setIsProcessingPayment(true);
        // Simulate high-fidelity processing
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessingPayment(false);
        setIsPaymentModalOpen(false);
        executeCheckout();
    };

    const executeCheckout = async () => {
        setIsPlacing(true);
        try {
            const paymentLabel = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.label || selectedPaymentMethod;
            const result = await checkout({
                shippingAddress: billing.shippingAddress,
                customerName: billing.customerName,
                phone: billing.phone,
                installmentPlan: billing.installmentPlan,
                installmentDetails: billing.installmentDetails,
                paymentMethod: paymentLabel
            });

            if (result.success) {
                setOrderData(result.order);
                setOrderPlaced(true);
            } else {
                alert('Order failed: ' + result.message);
            }
        } catch (err) {
            alert('Something went wrong. Try again.');
        } finally {
            setIsPlacing(false);
        }
    };

    const handleDownloadPDF = async () => {
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageW = doc.internal.pageSize.getWidth();
        const margin = 18;
        let y = 18;

        const orderId = orderData?._id || ('ORD-' + Date.now());
        const orderDate = orderData?.createdAt
            ? new Date(orderData.createdAt).toLocaleDateString('en-GB')
            : new Date().toLocaleDateString('en-GB');

        // ── Header background ──────────────────────────────────────
        doc.setFillColor(15, 15, 26);
        doc.rect(0, 0, pageW, 48, 'F');

        doc.setFontSize(20);
        doc.setTextColor(201, 162, 39);
        doc.text('DalChaal Supermarket', margin, y + 8);

        doc.setFontSize(9);
        doc.setTextColor(160, 160, 160);
        doc.text('Supermarket Overthinking Simulator', margin, y + 15);

        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text('BILLING RECEIPT', pageW - margin, y + 8, { align: 'right' });
        doc.setFontSize(9);
        doc.setTextColor(160, 160, 160);
        doc.text('Date: ' + orderDate, pageW - margin, y + 15, { align: 'right' });
        doc.text('Order ID: ' + String(orderId).slice(-10).toUpperCase(), pageW - margin, y + 21, { align: 'right' });

        y = 55;

        // ── Gold divider ───────────────────────────────────────────
        doc.setDrawColor(201, 162, 39);
        doc.setLineWidth(0.6);
        doc.line(margin, y, pageW - margin, y);
        y += 8;

        // ── Section helper ─────────────────────────────────────────
        const sectionHeader = (title) => {
            doc.setFillColor(235, 235, 235);
            doc.rect(margin, y, pageW - margin * 2, 7, 'F');
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.text(title, margin + 3, y + 5);
            y += 10;
        };

        // ── Customer Information ───────────────────────────────────
        sectionHeader('CUSTOMER INFORMATION');

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);

        const labelX = margin;
        const valueX = margin + 28;

        doc.setTextColor(100, 100, 100);
        doc.text('Name:', labelX, y);
        doc.setTextColor(30, 30, 30);
        doc.text(billing.customerName || '-', valueX, y);
        y += 6;

        doc.setTextColor(100, 100, 100);
        doc.text('Phone:', labelX, y);
        doc.setTextColor(30, 30, 30);
        doc.text(billing.phone || '-', valueX, y);
        y += 6;

        const addr = billing.shippingAddress;
        const addrStr = [addr.street, addr.city, addr.state, addr.zipCode ? addr.zipCode : '', addr.country]
            .filter(Boolean).join(', ');
        doc.setTextColor(100, 100, 100);
        doc.text('Address:', labelX, y);
        doc.setTextColor(30, 30, 30);
        const addrLines = doc.splitTextToSize(addrStr, pageW - margin * 2 - 28);
        doc.text(addrLines, valueX, y);
        y += addrLines.length * 5 + 6;

        // ── Payment Plan ───────────────────────────────────────────
        sectionHeader('PAYMENT PLAN');

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Plan:', labelX, y);
        doc.setTextColor(30, 30, 30);
        // eslint-disable-next-line no-control-regex
        doc.text((billing.planLabel || ('Plan ' + billing.installmentPlan)).replace(/[^\x00-\x7F]/g, ''), valueX, y);
        y += 7;

        billing.installmentDetails.forEach((inst) => {
            // eslint-disable-next-line no-control-regex
            const label = (inst.label || '').replace(/[^\x00-\x7F]/g, '');
            // eslint-disable-next-line no-control-regex
            const due = (inst.dueDate || '').replace(/[^\x00-\x7F]/g, '');
            const amt = 'Tk. ' + inst.amount;

            doc.setTextColor(80, 80, 80);
            doc.text(label + ':', margin, y);
            doc.setTextColor(30, 30, 30);
            doc.text(amt, margin + 70, y);
            doc.setTextColor(120, 120, 120);
            doc.text('(' + due + ')', margin + 95, y);
            y += 6;
        });

        // Payment method line
        const pmLabel = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.label || selectedPaymentMethod;
        doc.setTextColor(100, 100, 100);
        doc.text('Payment Method:', labelX, y);
        doc.setTextColor(30, 30, 30);
        doc.text(pmLabel, labelX + 45, y);
        y += 8;

        // ── Order Items ────────────────────────────────────────────
        sectionHeader('ORDER ITEMS');

        // Table column positions
        const colItem = margin;
        const colQty = pageW - margin - 50;
        const colPrice = pageW - margin - 30;
        const colSub = pageW - margin;

        // Table header row
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Item', colItem, y);
        doc.text('Qty', colQty, y, { align: 'center' });
        doc.text('Unit Price', colPrice, y, { align: 'right' });
        doc.text('Subtotal', colSub, y, { align: 'right' });
        y += 4;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        // Items
        doc.setFontSize(10);
        if (!items || items.length === 0) {
            doc.setTextColor(150, 150, 150);
            doc.text('No items recorded.', margin, y);
            y += 7;
        } else {
            items.forEach((cartItem) => {
                // eslint-disable-next-line no-control-regex
                const name = (cartItem.item?.name || 'Item').replace(/[^\x00-\x7F]/g, '');
                const qty = cartItem.quantity || 1;
                const price = cartItem.item?.price || 0;
                const sub = +(price * qty).toFixed(2);

                const nameLines = doc.splitTextToSize(name, colQty - margin - 4);

                doc.setTextColor(30, 30, 30);
                doc.text(nameLines, colItem, y);
                doc.text(String(qty), colQty, y, { align: 'center' });
                doc.text('Tk. ' + price, colPrice, y, { align: 'right' });
                doc.text('Tk. ' + sub, colSub, y, { align: 'right' });

                y += nameLines.length > 1 ? nameLines.length * 5 + 2 : 7;
            });
        }

        // ── Total row ──────────────────────────────────────────────
        y += 3;
        doc.setDrawColor(201, 162, 39);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        doc.setFillColor(255, 248, 220);
        doc.rect(margin, y - 4, pageW - margin * 2, 11, 'F');

        doc.setFontSize(12);
        doc.setTextColor(60, 40, 0);
        doc.text('GRAND TOTAL', margin + 3, y + 3);
        doc.setFontSize(13);
        doc.text('Tk. ' + total, pageW - margin, y + 3, { align: 'right' });
        y += 16;

        // First installment due
        const firstInst = billing.installmentDetails[0];
        if (firstInst && billing.installmentDetails.length > 1) {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('Amount Due Today:  Tk. ' + firstInst.amount, pageW - margin, y, { align: 'right' });
            y += 10;
        }

        // ── Footer ────────────────────────────────────────────────
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.line(margin, y, pageW - margin, y);
        y += 5;
        doc.text('Thank you for shopping at DalChaal Supermarket.', pageW / 2, y, { align: 'center' });
        y += 5;
        doc.text('This is a computer-generated receipt and does not require a signature.', pageW / 2, y, { align: 'center' });

        doc.save('DalChaal_Receipt_' + String(orderId).slice(-8).toUpperCase() + '.pdf');
    };

    // ── SUCCESS STATE ─────────────────────────────────────────────
    if (orderPlaced) {
        return (
            <div style={styles.pageWrapper}>
                <Navbar />
                <div style={styles.successContainer}>
                    <div style={styles.successIcon}>✓</div>
                    <h1 style={styles.successTitle}>Order Placed!</h1>
                    <p style={styles.successSub}>
                        Your order has been confirmed successfully.
                    </p>
                    {orderData && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '28px' }}>
                            Order ID: <span style={{ color: '#C9A227' }}>{String(orderData._id).slice(-10).toUpperCase()}</span>
                        </p>
                    )}
                    <div style={styles.successActions}>
                        <button
                            id="download-pdf-btn"
                            onClick={handleDownloadPDF}
                            style={styles.pdfBtn}
                        >
                            Download Bill (PDF)
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            style={styles.primaryBtn}
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => navigate('/browse')}
                            style={styles.ghostBtn}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── CONFIRMATION STATE ────────────────────────────────────────
    return (
        <div style={styles.pageWrapper}>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.stepBar}>
                        <div style={styles.stepDone}>1 - Billing Info</div>
                        <div style={styles.stepDivider}>→</div>
                        <div style={styles.stepActive}>2 - Confirm Order</div>
                        <div style={styles.stepDivider}>→</div>
                        <div style={styles.stepInactive}>3 - Done</div>
                    </div>
                    <h1 style={styles.title}>Confirm Your Order</h1>
                    <p style={styles.subtitle}>Review everything before placing your order</p>
                </div>

                <div style={styles.twoCol}>
                    {/* Left: Items + Billing Summary */}
                    <div>
                        {/* Items */}
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Order Items</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {items.map((cartItem) => (
                                    <div key={cartItem.item?._id} style={styles.itemRow}>
                                        <img
                                            src={cartItem.item?.image}
                                            alt={cartItem.item?.name}
                                            style={styles.itemImg}
                                            onError={e => {
                                                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80';
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{cartItem.item?.name}</div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                                                {cartItem.item?.category}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#C9A227', fontWeight: 700 }}>
                                                Tk. {cartItem.item?.price}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                                                x {cartItem.quantity}
                                            </div>
                                            <div style={{ fontWeight: 700 }}>
                                                Tk. {+(cartItem.item?.price * cartItem.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={styles.totalRow}>
                                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Total</span>
                                <span style={{ color: '#C9A227', fontSize: '20px', fontWeight: 700 }}>
                                    Tk. {total}
                                </span>
                            </div>
                        </div>

                        {/* Billing Info Summary */}
                        <div style={{ ...styles.card, marginTop: '20px' }}>
                            <h2 style={styles.cardTitle}>Billing Details</h2>
                            <InfoRow label="Name" value={billing.customerName} />
                            <InfoRow label="Phone" value={billing.phone} />
                            <InfoRow
                                label="Address"
                                value={[
                                    billing.shippingAddress.street,
                                    billing.shippingAddress.city,
                                    billing.shippingAddress.state,
                                    billing.shippingAddress.country
                                ].filter(Boolean).join(', ')}
                            />
                        </div>
                    </div>

                    {/* Right: Payment Plan + Place Order */}
                    <div>
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Payment Plan</h2>
                            <div style={{
                                padding: '12px 16px',
                                background: `${planColor}18`,
                                border: `1px solid ${planColor}40`,
                                borderRadius: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ color: planColor, fontWeight: 700, fontSize: '15px' }}>
                                    {billing.planLabel || 'Plan ' + billing.installmentPlan}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {billing.installmentDetails.map((inst) => (
                                    <div key={inst.installmentNumber} style={styles.installRow}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{inst.label}</div>
                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                                {inst.dueDate}
                                            </div>
                                        </div>
                                        <div style={{ color: planColor, fontWeight: 700, fontSize: '16px' }}>
                                            Tk. {inst.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ ...styles.totalRow, marginTop: '16px' }}>
                                <span>Grand Total</span>
                                <span style={{ color: '#C9A227', fontSize: '20px', fontWeight: 700 }}>
                                    Tk. {total}
                                </span>
                            </div>
                        </div>

                        <div style={{ ...styles.card, marginTop: '20px' }}>
                            <h2 style={styles.cardTitle}>Payment Method</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {PAYMENT_METHODS.map((method) => {
                                    const isSelected = selectedPaymentMethod === method.id;
                                    return (
                                        <div
                                            key={method.id}
                                            id={`pay-${method.id}`}
                                            onClick={() => setSelectedPaymentMethod(method.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '14px 16px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                border: isSelected
                                                    ? '1px solid rgba(201,162,39,0.5)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                                background: isSelected
                                                    ? 'rgba(201,162,39,0.08)'
                                                    : 'rgba(255,255,255,0.02)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '50%',
                                                border: `2px solid ${isSelected ? '#C9A227' : 'rgba(255,255,255,0.3)'}`,
                                                background: isSelected ? '#C9A227' : 'transparent',
                                                flexShrink: 0,
                                                transition: 'all 0.2s',
                                                boxShadow: isSelected ? '0 0 8px rgba(201,162,39,0.4)' : 'none'
                                            }} />
                                            <div>
                                                <div style={{
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    color: isSelected ? '#C9A227' : '#fff'
                                                }}>
                                                    {method.label}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    marginTop: '2px'
                                                }}>
                                                    {method.description}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            id="place-order-btn"
                            onClick={handlePlaceOrderClick}
                            disabled={isPlacing}
                            style={{
                                ...styles.primaryBtn,
                                marginTop: '20px',
                                width: '100%',
                                padding: '18px',
                                fontSize: '16px'
                            }}
                        >
                            {isPlacing ? 'Placing Order...' : 'Place Order'}
                        </button>

                        <button onClick={() => navigate('/billing')} style={styles.ghostBtn}>
                            Back to Billing
                        </button>
                    </div>
                </div>
            </div>

            {/* Mock Payment Dashboard Modal */}
            {isPaymentModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{
                        ...styles.modalContent,
                        borderTop: `6px solid ${selectedPaymentMethod === 'bkash' ? '#e2136e' :
                            selectedPaymentMethod === 'nagad' ? '#f57c00' :
                                selectedPaymentMethod === 'rocket' ? '#8e24aa' :
                                    '#1976d2'
                            }`
                    }}>
                        <div style={styles.modalHeader}>
                            <div style={styles.modalProvider}>
                                <div style={{
                                    ...styles.providerCircle,
                                    background:
                                        selectedPaymentMethod === 'bkash' ? '#e2136e' :
                                            selectedPaymentMethod === 'nagad' ? '#f57c00' :
                                                selectedPaymentMethod === 'rocket' ? '#8e24aa' :
                                                    '#1976d2'
                                }}>
                                    {selectedPaymentMethod.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={styles.providerName}>
                                        {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.label} Payment
                                    </div>
                                    <div style={styles.orderAmount}>Tk. {total}</div>
                                </div>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={styles.closeBtn}>×</button>
                        </div>

                        {isProcessingPayment ? (
                            <div style={styles.processingArea}>
                                <div style={styles.spinnerLarge}></div>
                                <div style={styles.processingText}>Processing Payment...</div>
                                <div style={styles.processingSub}>Securing your overthinking experience</div>
                            </div>
                        ) : (
                            <form onSubmit={handleMockPaymentConfirm} style={styles.modalForm}>
                                <div style={styles.inputWrap}>
                                    <label style={styles.modalLabel}>
                                        {selectedPaymentMethod === 'bank_transfer' ? 'Account Number' : 'Phone Number'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={selectedPaymentMethod === 'bank_transfer' ? 'Account No (Digits Only)' : '01XXXXXXXXX'}
                                        value={paymentPhone}
                                        onChange={(e) => {
                                            // Optional: help the user by preventing non-numeric chars immediately
                                            const val = e.target.value.replace(/\D/g, '');
                                            setPaymentPhone(val);
                                        }}
                                        style={styles.modalInput}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div style={styles.inputWrap}>
                                    <label style={styles.modalLabel}>Secret PIN</label>
                                    <input
                                        type="password"
                                        placeholder="****"
                                        value={paymentPin}
                                        onChange={(e) => setPaymentPin(e.target.value)}
                                        style={styles.modalInput}
                                        required
                                    />
                                </div>
                                <button type="submit" style={{
                                    ...styles.modalSubmit,
                                    background:
                                        selectedPaymentMethod === 'bkash' ? '#e2136e' :
                                            selectedPaymentMethod === 'nagad' ? '#f57c00' :
                                                selectedPaymentMethod === 'rocket' ? '#8e24aa' :
                                                    '#1976d2'
                                }}>
                                    Confirm Payment
                                </button>
                                <div style={styles.modalSecurity}>
                                    🔒 End-to-end encrypted simulation
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', minWidth: '70px' }}>{label}</span>
            <span style={{ color: '#fff' }}>{value}</span>
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
        maxWidth: '1100px',
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
    stepDone: {
        background: 'rgba(74,222,128,0.15)',
        color: '#4ade80',
        border: '1px solid rgba(74,222,128,0.3)',
        padding: '6px 16px',
        borderRadius: '20px',
        fontWeight: 600
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
    stepDivider: { color: 'rgba(255,255,255,0.2)' },
    title: {
        fontSize: '38px',
        fontFamily: "'Playfair Display', serif",
        background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A227 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '8px'
    },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '16px' },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '30px',
        alignItems: 'start'
    },
    card: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(10px)'
    },
    cardTitle: {
        fontSize: '17px',
        fontWeight: 700,
        marginBottom: '18px',
        color: 'rgba(255,255,255,0.9)'
    },
    itemRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)'
    },
    itemImg: {
        width: '56px',
        height: '56px',
        objectFit: 'cover',
        borderRadius: '10px'
    },
    installRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.06)'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '14px',
        marginTop: '14px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '16px',
        fontWeight: 600
    },
    paymentOption: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        background: 'rgba(201,162,39,0.08)',
        border: '1px solid rgba(201,162,39,0.3)',
        borderRadius: '12px'
    },
    radioActive: {
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#C9A227',
        flexShrink: 0,
        boxShadow: '0 0 8px rgba(201,162,39,0.5)'
    },
    primaryBtn: {
        display: 'block',
        padding: '14px 28px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #C9A227 0%, #E8D48A 100%)',
        color: '#0f0f1a',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(201,162,39,0.35)'
    },
    ghostBtn: {
        display: 'block',
        width: '100%',
        padding: '12px',
        marginTop: '10px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'transparent',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '14px',
        cursor: 'pointer',
        textAlign: 'center'
    },
    pdfBtn: {
        display: 'block',
        padding: '14px 28px',
        borderRadius: '12px',
        border: '1px solid rgba(201,162,39,0.5)',
        background: 'rgba(201,162,39,0.1)',
        color: '#C9A227',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: '12px',
        width: '100%',
        textAlign: 'center'
    },
    successContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '40px 20px',
        textAlign: 'center'
    },
    successIcon: {
        fontSize: '64px',
        color: '#4ade80',
        marginBottom: '16px',
        lineHeight: '1'
    },
    successTitle: {
        fontSize: '44px',
        fontFamily: "'Playfair Display', serif",
        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '12px'
    },
    successSub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '16px',
        maxWidth: '420px',
        marginBottom: '8px'
    },
    successActions: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '320px'
    },
    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.3s ease'
    },
    modalContent: {
        background: '#ffffff',
        width: '100%',
        maxWidth: '420px',
        borderRadius: '24px',
        padding: '32px',
        color: '#1a1a1a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px'
    },
    modalProvider: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    providerCircle: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    providerName: {
        fontWeight: 700,
        fontSize: '18px',
        color: '#1a1a1a'
    },
    orderAmount: {
        fontSize: '14px',
        color: '#666',
        fontWeight: 600
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '28px',
        color: '#ccc',
        cursor: 'pointer',
        padding: '0',
        lineHeight: '1',
        transition: 'color 0.2s'
    },
    modalForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    inputWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    modalLabel: {
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#999'
    },
    modalInput: {
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid #eee',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.2s',
        '&:focus': {
            borderColor: '#C9A227'
        }
    },
    modalSubmit: {
        padding: '18px',
        borderRadius: '14px',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s, filter 0.2s',
        marginTop: '8px'
    },
    modalSecurity: {
        textAlign: 'center',
        fontSize: '12px',
        color: '#aaa',
        marginTop: '8px'
    },
    processingArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 0'
    },
    spinnerLarge: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #C9A227',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px'
    },
    processingText: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: '8px'
    },
    processingSub: {
        fontSize: '14px',
        color: '#666'
    }
};

export default OrderConfirmation;
