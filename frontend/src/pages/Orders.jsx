import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Orders() {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 20px' }}>
                <div style={{
                    marginBottom: '50px',
                    padding: '40px',
                    background: 'var(--royal-gradient)',
                    borderRadius: '24px',
                    color: 'white',
                    boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'white', marginBottom: '8px', letterSpacing: '-1px' }}>
                            Purchase History
                        </h1>
                        <p style={{ fontSize: '18px', opacity: 0.9 }}>
                            A record of your past premium acquisitions
                        </p>
                    </div>
                    <div style={{ fontSize: '64px', opacity: 0.3 }}></div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '24px', fontWeight: '600' }}>Retrieving your records...</div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
                        <div style={{ fontSize: '80px', marginBottom: '24px' }}></div>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
                            No acquisitions yet
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '500px', margin: '0 auto 32px' }}>
                            Your collection is currently empty. Start browsing our premium items to see your orders here.
                        </p>
                        <button onClick={() => window.location.href = '/browse'} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '18px' }}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {orders.map((order) => (
                            <div key={order._id} className="card fade-in" style={{ border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    padding: '24px 32px',
                                    background: '#f8fafc',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </h3>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '50px',
                                                background: order.status === 'completed' ? '#dcfce7' : '#fef3c7',
                                                color: order.status === 'completed' ? '#166534' : '#92400e',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                            Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--royal-main)' }}>
                                            Tk. {order.totalPrice.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                                            Total Amount Paid
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '32px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                Order Items ({order.items.length})
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {order.items.map((orderItem, index) => (
                                                    <div key={index} style={{
                                                        display: 'flex',
                                                        gap: '16px',
                                                        padding: '16px',
                                                        background: '#fff',
                                                        borderRadius: '12px',
                                                        border: '1px solid #f1f5f9',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                                    }}>
                                                        {orderItem.item?.image && (
                                                            <img
                                                                src={orderItem.item.image}
                                                                alt={orderItem.name}
                                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                                            />
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                                {orderItem.name}
                                                            </div>
                                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                                Qty: {orderItem.quantity}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                            Tk. {(orderItem.price * orderItem.quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {order.shippingAddress && (
                                            <div>
                                                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                    Delivery Details
                                                </h4>
                                                <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                    <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.8, fontWeight: '500' }}>
                                                        <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>Recipient</strong>
                                                        {user?.username}<br />
                                                        <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginTop: '16px', marginBottom: '4px' }}>Address</strong>
                                                        {order.shippingAddress.street}<br />
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                                        {order.shippingAddress.country}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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

export default Orders;
