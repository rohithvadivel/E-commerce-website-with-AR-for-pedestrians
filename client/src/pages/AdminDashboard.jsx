import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { IndianRupee, ShieldCheck, Users, TrendingUp, Package, CheckCircle, XCircle, Clock, X, Eye, Layers, Hash, Calendar, User, FileText } from 'lucide-react';
import API_BASE_URL from '../config/api';

const PRODUCT_TYPE_LABELS = {
    electronics: '🖥️ Electronics',
    furniture: '🪑 Furniture',
    painting: '🎨 Painting',
    drawings: '✏️ Drawings'
};

const AdminDashboard = () => {
    const { token } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [totalCommission, setTotalCommission] = useState(0);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/payment/transactions`, {
                    headers: { 'x-auth-token': token }
                });
                setTransactions(res.data);

                const total = res.data.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
                setTotalCommission(total);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        const fetchPendingProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/pending`, {
                    headers: { 'x-auth-token': token }
                });
                setPendingProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPendingProducts();
    }, [token]);

    const handleApprove = async (productId) => {
        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/api/products/${productId}/approve`, {}, {
                headers: { 'x-auth-token': token }
            });
            setPendingProducts(prev => prev.filter(p => p._id !== productId));
            setSelectedProduct(null);
        } catch (err) {
            console.error(err);
            alert('Failed to approve product');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (productId) => {
        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/api/products/${productId}/reject`, {}, {
                headers: { 'x-auth-token': token }
            });
            setPendingProducts(prev => prev.filter(p => p._id !== productId));
            setSelectedProduct(null);
        } catch (err) {
            console.error(err);
            alert('Failed to reject product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="max-w-7xl mx-auto">
                <header className="admin-header">
                    <h1 className="admin-title">Platform Overview</h1>
                    <p className="admin-subtitle">Monitor financial performance and user activity.</p>
                </header>

                <div className="stats-grid">
                    {/* Stats Card 1 */}
                    <div className="stat-card stat-card-gradient">
                        <div className="stat-card-header">
                            <div className="stat-icon stat-icon-gradient">
                                <IndianRupee size={24} />
                            </div>
                            <span className="stat-badge">+12%</span>
                        </div>
                        <h3 className="stat-label stat-label-light">Total Commission</h3>
                        <p className="stat-value">₹{totalCommission.toFixed(2)}</p>
                    </div>

                    {/* Stats Card 2 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon stat-icon-blue">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="stat-label stat-label-dark">Total Transactions</h3>
                            <p className="stat-value stat-value-dark">{transactions.length}</p>
                        </div>
                    </div>

                    {/* Stats Card 3 - Pending Approvals */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                                <Clock size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="stat-label stat-label-dark">Pending Approvals</h3>
                            <p className="stat-value stat-value-dark">{pendingProducts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Pending Products Section */}
                {pendingProducts.length > 0 && (
                    <div className="transactions-card mb-8">
                        <div className="transactions-header" style={{ borderBottom: '2px solid #f59e0b' }}>
                            <Package className="transactions-icon" size={20} style={{ color: '#f59e0b' }} />
                            <h3 className="transactions-title">Products Awaiting Approval</h3>
                            <span style={{ marginLeft: 'auto', backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600' }}>
                                {pendingProducts.length} pending
                            </span>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {pendingProducts.map(product => (
                                    <div key={product._id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <div
                                            onClick={() => setSelectedProduct(product)}
                                            style={{ height: '160px', backgroundColor: '#f3f4f6', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                            <div style={{
                                                position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                                                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px',
                                                opacity: 0, transition: 'opacity 0.3s ease'
                                            }}
                                                onMouseOver={e => e.currentTarget.style.opacity = 1}
                                                onMouseOut={e => e.currentTarget.style.opacity = 0}
                                            >
                                                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '20px' }}>
                                                    <Eye size={14} /> Click to Inspect
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <h4 style={{ fontWeight: '600', fontSize: '1rem', color: '#111827', marginBottom: '0.25rem' }}>{product.title}</h4>
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>by {product.seller?.name || 'Unknown Seller'}</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4f46e5', marginBottom: '1rem' }}>₹{product.price}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleApprove(product._id)}
                                                    disabled={loading}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem', backgroundColor: '#10b981', color: '#fff', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', border: 'none' }}
                                                >
                                                    <CheckCircle size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(product._id)}
                                                    disabled={loading}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem', backgroundColor: '#ef4444', color: '#fff', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', border: 'none' }}
                                                >
                                                    <XCircle size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="transactions-card">
                    <div className="transactions-header">
                        <ShieldCheck className="transactions-icon" size={20} />
                        <h3 className="transactions-title">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Buyer</th>
                                    <th>Amount</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(t => (
                                    <tr key={t._id}>
                                        <td className="font-mono text-gray-600">#{t._id.substring(0, 8)}...</td>
                                        <td className="font-medium text-gray-900">{t.buyer?.name || 'Unknown'}</td>
                                        <td className="text-gray-900">₹{t.totalAmount}</td>
                                        <td className="font-bold text-green-600">+₹{t.commissionAmount.toFixed(2)}</td>
                                        <td>
                                            <span className="status-badge status-badge-success">
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && <p className="p-10 text-center text-gray-400">No transactions recorded yet.</p>}
                    </div>
                </div>
            </div>

            {/* ───── Product Inspection Modal ───── */}
            {selectedProduct && (
                <div
                    onClick={() => setSelectedProduct(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        animation: 'fadeIn 0.2s ease'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: '1.5rem', overflow: 'hidden',
                            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                            animation: 'slideUp 0.3s ease'
                        }}
                    >
                        {/* Modal Image */}
                        <div style={{ position: 'relative', background: '#f3f4f6' }}>
                            <img
                                src={selectedProduct.image}
                                alt={selectedProduct.title}
                                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
                            />
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                                    borderRadius: '50%', width: '36px', height: '36px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', backdropFilter: 'blur(4px)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                            >
                                <X size={18} />
                            </button>
                            <div style={{
                                position: 'absolute', bottom: '12px', left: '12px',
                                background: '#f59e0b', color: '#fff', padding: '4px 14px',
                                borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                {selectedProduct.status}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem 2rem 2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '0.25rem' }}>
                                {selectedProduct.title}
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                                Product ID: <span style={{ fontFamily: 'monospace', color: '#9ca3af' }}>{selectedProduct._id}</span>
                            </p>

                            {/* Detail Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                {/* Seller */}
                                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', border: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        <User size={13} /> Seller
                                    </div>
                                    <p style={{ fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>{selectedProduct.seller?.name || 'Unknown'}</p>
                                </div>

                                {/* Price */}
                                <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '14px', border: '1px solid #dcfce7' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        <IndianRupee size={13} /> Price
                                    </div>
                                    <p style={{ fontWeight: '700', color: '#16a34a', fontSize: '1.25rem' }}>₹{selectedProduct.price}</p>
                                </div>

                                {/* Quantity */}
                                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', border: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        <Hash size={13} /> Quantity
                                    </div>
                                    <p style={{ fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>{selectedProduct.quantity}</p>
                                </div>

                                {/* Product Type */}
                                <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '14px', border: '1px solid #e0e7ff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        <Layers size={13} /> Category
                                    </div>
                                    <p style={{ fontWeight: '600', color: '#4338ca', fontSize: '0.95rem' }}>
                                        {PRODUCT_TYPE_LABELS[selectedProduct.productType] || selectedProduct.productType || 'Not set'}
                                    </p>
                                </div>

                                {/* Created At */}
                                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', border: '1px solid #f3f4f6', gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        <Calendar size={13} /> Listed On
                                    </div>
                                    <p style={{ fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
                                        {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedProduct.description && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                        <FileText size={14} /> Description
                                    </div>
                                    <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem', background: '#f9fafb', padding: '14px 16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                                        {selectedProduct.description}
                                    </p>
                                </div>
                            )}

                            {/* 3D Model indicator */}
                            {selectedProduct.model3D && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', background: '#faf5ff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🧊</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#7c3aed' }}>3D Model attached (AR-ready)</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => handleApprove(selectedProduct._id)}
                                    disabled={loading}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '14px', backgroundColor: '#10b981', color: '#fff', borderRadius: '12px',
                                        fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                                        transition: 'background 0.2s', opacity: loading ? 0.6 : 1
                                    }}
                                    onMouseOver={e => { if (!loading) e.currentTarget.style.backgroundColor = '#059669'; }}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#10b981'}
                                >
                                    <CheckCircle size={20} />
                                    Approve Product
                                </button>
                                <button
                                    onClick={() => handleReject(selectedProduct._id)}
                                    disabled={loading}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '14px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '12px',
                                        fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                                        transition: 'background 0.2s', opacity: loading ? 0.6 : 1
                                    }}
                                    onMouseOver={e => { if (!loading) e.currentTarget.style.backgroundColor = '#dc2626'; }}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                                >
                                    <XCircle size={20} />
                                    Reject Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Animations */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
