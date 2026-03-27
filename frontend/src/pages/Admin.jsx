import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

// ─── Small helpers ──────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const CATEGORIES = [
    'Rice & Grains', 'Dal & Pulses', 'Fish', 'Vegetables', 'Spices', 'Snacks', 'Beverages',
    'Bakery', 'Grocery', 'Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Frozen Foods',
    'Snacks & Confectionery', 'Personal Care', 'Household', 'Electronics',
    'Health & Wellness', 'Baby & Kids', 'Pet Supplies', 'Other'
];

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

const STATUS_COLORS = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
};

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #1e1e2e, #252540)',
            border: `1px solid ${color}33`,
            borderRadius: 16,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            boxShadow: `0 4px 20px ${color}22`,
            flex: '1 1 200px',
            minWidth: 180,
        }}>
            <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `${color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 26, color
            }}>{icon}</div>
            <div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{label}</div>
                <div style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700 }}>{value}</div>
            </div>
        </div>
    );
}

// ─── Modal ──────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20
        }} onClick={onClose}>
            <div style={{
                background: '#1e1e2e', borderRadius: 20, padding: 32,
                width: '100%', maxWidth: 560, maxHeight: '90vh',
                overflowY: 'auto', border: '1px solid #334155',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                    <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 20 }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#94a3b8',
                        fontSize: 22, cursor: 'pointer', lineHeight: 1
                    }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Styled Input / Select ──────────────────────────────────────────────────
const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
};

const labelStyle = { color: '#94a3b8', fontSize: 13, marginBottom: 6, display: 'block' };

// ─── Product Form ────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel }) {
    const blank = {
        name: '', category: 'Grocery', price: '', brand: 'Store Brand',
        inStock: true, image: '', comment: '', overthinkingComment: 'Are you sure you want this?'
    };
    const [form, setForm] = useState(initial || blank);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
                ['Product Name', 'name', 'text'],
                ['Brand', 'brand', 'text'],
                ['Price (BDT)', 'price', 'number'],
                ['Image URL', 'image', 'text'],
                ['Comment', 'comment', 'text'],
                ['Overthinking Comment', 'overthinkingComment', 'text'],
            ].map(([lbl, key, type]) => (
                <div key={key}>
                    <label style={labelStyle}>{lbl}</label>
                    <input
                        style={inputStyle} type={type} value={form[key] || ''}
                        onChange={e => set(key, e.target.value)}
                    />
                </div>
            ))}

            <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="inStock" checked={form.inStock}
                    onChange={e => set('inStock', e.target.checked)} />
                <label htmlFor="inStock" style={{ color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>In Stock</label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => onSave(form)} style={{
                    flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer'
                }}>Save Product</button>
                <button onClick={onCancel} style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    border: '1px solid #334155', background: 'transparent',
                    color: '#94a3b8', fontSize: 15, cursor: 'pointer'
                }}>Cancel</button>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Admin() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [productModal, setProductModal] = useState(null); // null | 'add' | product obj
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const apiFetch = useCallback(async (path, opts = {}) => {
        const res = await fetch(`${API_BASE}/admin${path}`, { headers, ...opts });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        return data;
    }, [token]); // eslint-disable-line

    // Redirect non-admins
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/dashboard');
    }, [user, navigate]);

    // Fetch data per tab
    useEffect(() => {
        if (!token) return;
        setLoading(true);
        const loaders = {
            overview: () => apiFetch('/stats').then(setStats),
            products: () => apiFetch('/products').then(setProducts),
            orders: () => apiFetch('/orders').then(setOrders),
            users: () => apiFetch('/users').then(setUsers),
        };
        (loaders[tab] || (() => Promise.resolve()))()
            .catch(e => showToast(e.message, 'error'))
            .finally(() => setLoading(false));
    }, [tab, token]); // eslint-disable-line

    // ── Products CRUD
    const handleSaveProduct = async (form) => {
        try {
            if (productModal === 'add') {
                const p = await apiFetch('/products', { method: 'POST', body: JSON.stringify(form) });
                setProducts(ps => [p, ...ps]);
                showToast('Product added!');
            } else {
                const p = await apiFetch(`/products/${productModal._id}`, { method: 'PUT', body: JSON.stringify(form) });
                setProducts(ps => ps.map(x => x._id === p._id ? p : x));
                showToast('Product updated!');
            }
            setProductModal(null);
        } catch (e) { showToast(e.message, 'error'); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE' });
            setProducts(ps => ps.filter(p => p._id !== id));
            showToast('Product deleted');
        } catch (e) { showToast(e.message, 'error'); }
    };

    // ── Orders
    const handleOrderStatus = async (id, status) => {
        try {
            const o = await apiFetch(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
            setOrders(os => os.map(x => x._id === o._id ? o : x));
            showToast('Order status updated');
        } catch (e) { showToast(e.message, 'error'); }
    };

    // ── Users
    const handleUserRole = async (id, role) => {
        try {
            const u = await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ role }) });
            setUsers(us => us.map(x => x._id === u._id ? u : x));
            showToast('User role updated');
        } catch (e) { showToast(e.message, 'error'); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await apiFetch(`/users/${id}`, { method: 'DELETE' });
            setUsers(us => us.filter(u => u._id !== id));
            showToast('User deleted');
        } catch (e) { showToast(e.message, 'error'); }
    };

    const filtered = (arr, keys) =>
        arr.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(search.toLowerCase())));

    // ─────────────────────────────────────────────────────────────────────────
    const TABS = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'products', label: '📦 Products' },
        { id: 'orders', label: '🛒 Orders' },
        { id: 'users', label: '👤 Users' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 2000,
                    padding: '14px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14,
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    animation: 'slideIn 0.3s ease'
                }}>{toast.msg}</div>
            )}

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1e2e, #252540)',
                borderBottom: '1px solid #1e293b',
                padding: '0 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 64, position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18
                    }}>🛍️</div>
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>Admin Panel</span>
                    <span style={{
                        background: '#6366f133', color: '#818cf8', borderRadius: 6,
                        padding: '2px 10px', fontSize: 12, fontWeight: 600
                    }}>DalChaal</span>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{
                    background: '#1e293b', border: '1px solid #334155',
                    color: '#94a3b8', padding: '8px 18px', borderRadius: 10,
                    cursor: 'pointer', fontSize: 13
                }}>← Dashboard</button>
            </div>

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
                {/* Sidebar */}
                <div style={{
                    width: 220, background: '#161622', padding: '24px 16px',
                    borderRight: '1px solid #1e293b', flexShrink: 0
                }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }} style={{
                            width: '100%', textAlign: 'left', padding: '12px 16px',
                            borderRadius: 12, border: 'none', cursor: 'pointer',
                            fontSize: 14, fontWeight: 600, marginBottom: 6,
                            background: tab === t.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                            color: tab === t.id ? '#fff' : '#94a3b8',
                            transition: 'all 0.2s'
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

                    {/* ── OVERVIEW ── */}
                    {tab === 'overview' && (
                        <div>
                            <h2 style={{ color: '#f1f5f9', marginBottom: 28, fontSize: 24 }}>Overview</h2>
                            {loading ? <Spinner /> : stats && (
                                <>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 32 }}>
                                        <StatCard icon="👤" label="Total Users" value={stats.totalUsers} color="#6366f1" />
                                        <StatCard icon="📦" label="Products" value={stats.totalProducts} color="#f59e0b" />
                                        <StatCard icon="🛒" label="Total Orders" value={stats.totalOrders} color="#10b981" />
                                        <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} color="#ef4444" />
                                        <StatCard icon="💰" label="Revenue" value={fmt(stats.revenue)} color="#a78bfa" />
                                    </div>

                                    <div style={{
                                        background: 'linear-gradient(135deg, #1e1e2e, #252540)',
                                        border: '1px solid #334155', borderRadius: 16, padding: '28px 32px'
                                    }}>
                                        <h3 style={{ color: '#f1f5f9', marginBottom: 20 }}>Quick Actions</h3>
                                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                            {[
                                                { label: 'Manage Products', icon: '📦', t: 'products', color: '#f59e0b' },
                                                { label: 'View Orders', icon: '🛒', t: 'orders', color: '#10b981' },
                                                { label: 'Manage Users', icon: '👤', t: 'users', color: '#6366f1' },
                                            ].map(q => (
                                                <button key={q.t} onClick={() => setTab(q.t)} style={{
                                                    padding: '12px 22px', borderRadius: 12,
                                                    border: `1px solid ${q.color}44`,
                                                    background: `${q.color}11`, color: q.color,
                                                    cursor: 'pointer', fontSize: 14, fontWeight: 600
                                                }}>{q.icon} {q.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── PRODUCTS ── */}
                    {tab === 'products' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                                <h2 style={{ color: '#f1f5f9', fontSize: 24, margin: 0 }}>Products</h2>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <SearchBox value={search} onChange={setSearch} placeholder="Search products…" />
                                    <button onClick={() => setProductModal('add')} style={{
                                        padding: '10px 20px', borderRadius: 10, border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap'
                                    }}>+ Add Product</button>
                                </div>
                            </div>
                            {loading ? <Spinner /> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {filtered(products, ['name', 'category', 'brand']).map(p => (
                                        <div key={p._id} style={{
                                            background: 'linear-gradient(135deg, #1e1e2e, #252540)',
                                            border: '1px solid #334155', borderRadius: 14, padding: '18px 22px',
                                            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap'
                                        }}>
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} />
                                            ) : (
                                                <div style={{
                                                    width: 56, height: 56, borderRadius: 10,
                                                    background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                                                }}>📦</div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 140 }}>
                                                <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                                                <div style={{ color: '#64748b', fontSize: 13 }}>{p.category} · {p.brand}</div>
                                            </div>
                                            <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 16, minWidth: 80 }}>{fmt(p.price)}</div>
                                            <span style={{
                                                background: p.inStock ? '#10b98122' : '#ef444422',
                                                color: p.inStock ? '#10b981' : '#ef4444',
                                                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                                            }}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <IconBtn onClick={() => setProductModal(p)} color="#6366f1">✏️</IconBtn>
                                                <IconBtn onClick={() => handleDeleteProduct(p._id)} color="#ef4444">🗑️</IconBtn>
                                            </div>
                                        </div>
                                    ))}
                                    {filtered(products, ['name', 'category', 'brand']).length === 0 && (
                                        <EmptyState label="No products found" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ORDERS ── */}
                    {tab === 'orders' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                                <h2 style={{ color: '#f1f5f9', fontSize: 24, margin: 0 }}>Orders</h2>
                                <SearchBox value={search} onChange={setSearch} placeholder="Search by user or status…" />
                            </div>
                            {loading ? <Spinner /> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {filtered(orders, ['status', 'paymentMethod', 'customerName']).map(o => (
                                        <div key={o._id} style={{
                                            background: 'linear-gradient(135deg, #1e1e2e, #252540)',
                                            border: '1px solid #334155', borderRadius: 14, padding: '20px 24px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                                <div>
                                                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>
                                                        #{o._id.slice(-8).toUpperCase()}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                                                        {o.user?.username || 'Unknown'} · {o.user?.email || ''}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: 13 }}>{fmtDate(o.createdAt)}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 18 }}>{fmt(o.totalPrice)}</div>
                                                    <div style={{ color: '#64748b', fontSize: 13 }}>{o.items?.length} item(s)</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                <select
                                                    value={o.status}
                                                    onChange={e => handleOrderStatus(o._id, e.target.value)}
                                                    style={{
                                                        ...inputStyle, width: 'auto', padding: '6px 12px',
                                                        color: STATUS_COLORS[o.status] || '#f1f5f9',
                                                        borderColor: STATUS_COLORS[o.status] || '#334155'
                                                    }}
                                                >
                                                    {ORDER_STATUSES.map(s => (
                                                        <option key={s} style={{ color: STATUS_COLORS[s] }}>{s}</option>
                                                    ))}
                                                </select>
                                                <span style={{
                                                    background: `${STATUS_COLORS[o.status]}22`,
                                                    color: STATUS_COLORS[o.status],
                                                    padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}>{o.status}</span>
                                                <span style={{ color: '#64748b', fontSize: 13 }}>· {o.paymentMethod}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {filtered(orders, ['status', 'paymentMethod', 'customerName']).length === 0 && (
                                        <EmptyState label="No orders found" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── USERS ── */}
                    {tab === 'users' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                                <h2 style={{ color: '#f1f5f9', fontSize: 24, margin: 0 }}>Users</h2>
                                <SearchBox value={search} onChange={setSearch} placeholder="Search by username or email…" />
                            </div>
                            {loading ? <Spinner /> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {filtered(users, ['username', 'email', 'role']).map(u => (
                                        <div key={u._id} style={{
                                            background: 'linear-gradient(135deg, #1e1e2e, #252540)',
                                            border: '1px solid #334155', borderRadius: 14, padding: '18px 24px',
                                            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap'
                                        }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: '50%',
                                                background: u.role === 'admin'
                                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                    : 'linear-gradient(135deg, #334155, #475569)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0
                                            }}>
                                                {u.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 140 }}>
                                                <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15 }}>{u.username}</div>
                                                <div style={{ color: '#64748b', fontSize: 13 }}>{u.email}</div>
                                                <div style={{ color: '#64748b', fontSize: 12 }}>Joined {fmtDate(u.createdAt)}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                <select
                                                    value={u.role}
                                                    onChange={e => handleUserRole(u._id, e.target.value)}
                                                    style={{
                                                        ...inputStyle, width: 'auto', padding: '6px 12px'
                                                    }}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <span style={{
                                                    background: u.role === 'admin' ? '#6366f122' : '#33415522',
                                                    color: u.role === 'admin' ? '#818cf8' : '#94a3b8',
                                                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
                                                }}>{u.role}</span>
                                                {u._id !== user?._id && (
                                                    <IconBtn onClick={() => handleDeleteUser(u._id)} color="#ef4444">🗑️</IconBtn>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filtered(users, ['username', 'email', 'role']).length === 0 && (
                                        <EmptyState label="No users found" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Product Modal */}
            {productModal && (
                <Modal
                    title={productModal === 'add' ? 'Add New Product' : `Edit: ${productModal.name}`}
                    onClose={() => setProductModal(null)}
                >
                    <ProductForm
                        initial={productModal === 'add' ? null : productModal}
                        onSave={handleSaveProduct}
                        onCancel={() => setProductModal(null)}
                    />
                </Modal>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #0f172a; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
            `}</style>
        </div>
    );
}

// ─── Micro-components ────────────────────────────────────────────────────────
function Spinner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{
                width: 40, height: 40, border: '3px solid #334155',
                borderTop: '3px solid #6366f1', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
        </div>
    );
}

function EmptyState({ label }) {
    return (
        <div style={{
            textAlign: 'center', padding: '60px 20px', color: '#475569',
            background: '#1e1e2e', borderRadius: 14, border: '1px dashed #334155'
        }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16 }}>{label}</div>
        </div>
    );
}

function IconBtn({ onClick, color, children }) {
    return (
        <button onClick={onClick} style={{
            width: 36, height: 36, borderRadius: 8, border: `1px solid ${color}44`,
            background: `${color}11`, color: color, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>{children}</button>
    );
}

function SearchBox({ value, onChange, placeholder }) {
    return (
        <input
            value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ ...inputStyle, width: 240, padding: '10px 16px' }}
        />
    );
}
