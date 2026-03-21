import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import ShoppingAssistant from './pages/ShoppingAssistant';
import Billing from './pages/Billing';
import OrderConfirmation from './pages/OrderConfirmation';

// Protected Route Component
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: "'Roboto', sans-serif"
            }}>
                Loading...
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/browse"
                            element={
                                <ProtectedRoute>
                                    <Browse />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute>
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/assistant"
                            element={
                                <ProtectedRoute>
                                    <ShoppingAssistant />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/billing"
                            element={
                                <ProtectedRoute>
                                    <Billing />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/confirm"
                            element={
                                <ProtectedRoute>
                                    <OrderConfirmation />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/login" />} />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
