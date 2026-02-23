import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL, { getImageUrl } from '../config/api';

const MyOrders = () => {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/payment/buyer-orders`, {
                    headers: { 'x-auth-token': token }
                });
                setOrders(res.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '100px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 48px' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <Link to="/buyer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6b7280', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginBottom: '16px' }}>
                        <ArrowLeft size={16} /> Back to Shop
                    </Link>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', fontFamily: 'serif', margin: '0 0 8px' }}>
                        My Orders
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Track your order delivery status</p>
                </div>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed #d1d5db' }}>
                        <Package size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No orders yet</h3>
                        <p style={{ color: '#64748b', maxWidth: '320px', margin: '0 auto 24px' }}>Start shopping to see your orders here.</p>
                        <Link to="/buyer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.map(order => (
                            <div key={order._id} style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                {/* Order Header */}
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Order ID</p>
                                        <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#475569', margin: 0 }}>#{order._id.substring(0, 12)}...</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', margin: '0 0 4px' }}>Date</p>
                                        <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '700',
                                        backgroundColor: order.deliveryStatus === 'Delivered' ? '#dcfce7' : '#fef3c7',
                                        color: order.deliveryStatus === 'Delivered' ? '#166534' : '#92400e',
                                        border: `1px solid ${order.deliveryStatus === 'Delivered' ? '#bbf7d0' : '#fde68a'}`
                                    }}>
                                        {order.deliveryStatus === 'Delivered' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {order.deliveryStatus}
                                    </div>
                                </div>

                                {/* Products */}
                                <div style={{ padding: '20px 24px' }}>
                                    {order.products.map((p, idx) => (
                                        p.product && (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: idx < order.products.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                                                    <img src={getImageUrl(p.product.image)} alt={p.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: '600', color: '#1e293b', margin: '0 0 2px', fontSize: '15px' }}>{p.product.title}</p>
                                                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Qty: {p.quantity}</p>
                                                </div>
                                                <p style={{ fontWeight: '700', color: '#4f46e5', fontSize: '15px', margin: 0 }}>₹{p.product.price}</p>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Truck size={16} style={{ color: order.deliveryStatus === 'Delivered' ? '#16a34a' : '#f59e0b' }} />
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>
                                            {order.deliveryStatus === 'Delivered'
                                                ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                : 'DAC code sent to your email'
                                            }
                                        </span>
                                    </div>
                                    <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '18px', margin: 0 }}>₹{order.totalAmount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
