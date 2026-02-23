import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddProduct from '../components/AddProduct';
import MyProducts from '../components/MyProducts';
import SellerInsights from '../components/SellerInsights';
import { BarChart3, Package, Settings, LogOut, LayoutDashboard, PlusCircle, Briefcase, ClipboardList, Truck, CheckCircle, Clock, X, Shield } from 'lucide-react';
import API_BASE_URL, { getImageUrl } from '../config/api';

const SellerDashboard = () => {
    const { user, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [dacModal, setDacModal] = useState({ open: false, orderId: null });
    const [dacInput, setDacInput] = useState('');
    const [dacError, setDacError] = useState('');
    const [dacLoading, setDacLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Real-time globally synced fetch (every 5 seconds)
    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async (showLoader = false) => {
            console.log("FETCH DASHBOARD DATA FIRING");
            if (showLoader) setOrdersLoading(true);
            try {
                const timestamp = new Date().getTime();
                const config = {
                    headers: { 'x-auth-token': token, 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' }
                };

                const [ordersRes, productsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/payment/seller-orders?t=${timestamp}`, config),
                    axios.get(`${API_BASE_URL}/api/products/myproducts?t=${timestamp}`, config)
                ]);

                console.log("FETCHED ORDERS:", ordersRes.data);
                console.log("FETCHED PRODUCTS:", productsRes.data);

                if (isMounted) {
                    setOrders(ordersRes.data);
                    setProducts(productsRes.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                if (isMounted && showLoader) setOrdersLoading(false);
            }
        };

        // Initial fetch with loader
        fetchDashboardData(true);

        // Silent continuous polling
        const intervalId = setInterval(() => {
            fetchDashboardData(false);
        }, 2500);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [token]);

    const fetchOrders = async () => {
        // Manual refresh fallback
        setOrdersLoading(true);
        try {
            const timestamp = new Date().getTime();
            const config = {
                headers: { 'x-auth-token': token, 'Cache-Control': 'no-cache, no-store, must-revalidate' }
            };
            const [ordersRes, productsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/payment/seller-orders?t=${timestamp}`, config),
                axios.get(`${API_BASE_URL}/api/products/myproducts?t=${timestamp}`, config)
            ]);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const openDacModal = (orderId) => {
        setDacModal({ open: true, orderId });
        setDacInput('');
        setDacError('');
    };

    const closeDacModal = () => {
        setDacModal({ open: false, orderId: null });
        setDacInput('');
        setDacError('');
    };

    const handleVerifyDAC = async () => {
        if (!dacInput.trim()) {
            setDacError('Please enter the DAC code');
            return;
        }
        if (dacInput.trim().length !== 6) {
            setDacError('DAC code must be 6 digits');
            return;
        }

        setDacLoading(true);
        setDacError('');

        try {
            await axios.put(`${API_BASE_URL}/api/payment/verify-dac/${dacModal.orderId}`, {
                dacCode: dacInput.trim()
            }, {
                headers: { 'x-auth-token': token }
            });

            // Update the order in state
            setOrders(prev => prev.map(o =>
                o._id === dacModal.orderId
                    ? { ...o, deliveryStatus: 'Delivered', deliveredAt: new Date().toISOString() }
                    : o
            ));
            closeDacModal();
        } catch (err) {
            setDacError(err.response?.data?.error || 'Verification failed. Please try again.');
        } finally {
            setDacLoading(false);
        }
    };

    const Sparkles = ({ size, className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
        </svg>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Premium Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-gold/20">
                            <Briefcase size={22} />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-slate-900">Artist <span className="text-indigo-600">Studio</span></h2>
                    </div>

                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <Package size={20} />
                            <span>My Collection</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <ClipboardList size={20} />
                            <span>Orders</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <BarChart3 size={20} />
                            <span>Studio Insights</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <Settings size={20} />
                            <span>Gallery Settings</span>
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <LogOut size={20} />
                        <span>Leave Studio</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 px-6 lg:px-12 py-10 overflow-y-auto mt-20 lg:mt-0">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                            Welcome, <span className="text-indigo-600">{user?.name}</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Manage your exhibitions and track your artistic growth.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hidden sm:block">
                            <LayoutDashboard size={20} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Mobile Tab Bar - visible only on small screens */}
                <div style={{
                    display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px',
                    marginBottom: '24px', backgroundColor: '#f1f5f9', borderRadius: '16px',
                    WebkitOverflowScrolling: 'touch'
                }} className="lg:hidden">
                    {[
                        { key: 'products', label: 'Products', icon: <Package size={16} /> },
                        { key: 'orders', label: 'Orders', icon: <ClipboardList size={16} /> },
                        { key: 'analytics', label: 'Insights', icon: <BarChart3 size={16} /> },
                        { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 16px', borderRadius: '12px', border: 'none',
                                fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                whiteSpace: 'nowrap', transition: 'all 0.2s', flex: '1',
                                justifyContent: 'center', minWidth: 'fit-content',
                                backgroundColor: activeTab === tab.key ? '#4f46e5' : 'transparent',
                                color: activeTab === tab.key ? 'white' : '#64748b',
                                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="animate-in slide-in-from-bottom-5 duration-700">
                    {activeTab === 'products' && (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                            <div className="xl:col-span-4">
                                <AddProduct />
                            </div>
                            <div className="xl:col-span-8">
                                <MyProducts />
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 className="text-2xl font-serif font-bold text-slate-900">Order Management</h2>
                                <button onClick={fetchOrders} style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                                    Refresh
                                </button>
                            </div>

                            {ordersLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px' }}>
                                    <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                                    <p style={{ color: '#6b7280' }}>Loading orders...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: 'white', borderRadius: '24px', border: '1px dashed #d1d5db' }}>
                                    <ClipboardList size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>No orders yet</h3>
                                    <p style={{ color: '#64748b' }}>Orders for your products will appear here.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {orders.map(order => (
                                        <div key={order._id} style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                            {/* Order Header */}
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                <div>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Order</p>
                                                    <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#475569', margin: 0, fontWeight: '600' }}>#{order._id.substring(0, 12)}...</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Buyer</p>
                                                    <p style={{ fontSize: '14px', color: '#1e293b', margin: 0, fontWeight: '600' }}>{order.buyer?.name || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Date</p>
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
                                            <div style={{ padding: '16px 24px' }}>
                                                {order.products.map((p, idx) => (
                                                    p.product && (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: idx < order.products.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                                                                <img src={getImageUrl(p.product.image)} alt={p.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <p style={{ fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '14px' }}>{p.product.title}</p>
                                                                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 0' }}>Qty: {p.quantity}</p>
                                                            </div>
                                                            <p style={{ fontWeight: '700', color: '#4f46e5', margin: 0 }}>₹{p.product.price}</p>
                                                        </div>
                                                    )
                                                ))}
                                            </div>

                                            {/* Order Footer */}
                                            <div style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '16px', margin: 0 }}>Total: ₹{order.totalAmount}</p>
                                                {order.deliveryStatus === 'Not Delivered' ? (
                                                    <button
                                                        onClick={() => openDacModal(order._id)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                            padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white',
                                                            borderRadius: '12px', border: 'none', fontSize: '14px',
                                                            fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                                                            boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                                                        }}
                                                    >
                                                        <Truck size={16} /> Mark as Delivered
                                                    </button>
                                                ) : (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '700', fontSize: '14px' }}>
                                                        <CheckCircle size={16} /> Delivered {order.deliveredAt && `on ${new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <SellerInsights orders={orders} products={products} loading={ordersLoading} />
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ backgroundColor: 'white', borderRadius: '2rem', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ padding: '16px', backgroundColor: '#0f172a', color: '#d4a853', borderRadius: '16px' }}>
                                    <Settings size={28} />
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Studio Configuration</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '42rem' }}>
                                <div style={{ padding: '32px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid transparent' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Artist Profile
                                        <div style={{ height: '6px', width: '6px', backgroundColor: '#4f46e5', borderRadius: '50%' }} />
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '4px' }}>Public Name</p>
                                            <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '15px', margin: 0 }}>{user?.name}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '4px' }}>Artist Email</p>
                                            <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '15px', margin: 0 }}>{user?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '32px', backgroundColor: 'rgba(212,168,83,0.05)', borderRadius: '24px', border: '1px solid rgba(212,168,83,0.1)' }}>
                                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#92400e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Global Commissions
                                        <Sparkles size={16} />
                                    </h4>
                                    <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                                        A fixed platform fee of <span style={{ fontWeight: '700', color: '#92400e' }}>3%</span> is applied to all sales to maintain our premier hosting and AR experiences.
                                    </p>
                                    <div style={{ width: '100%', backgroundColor: 'rgba(212,168,83,0.15)', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ backgroundColor: '#d4a853', height: '100%', width: '3%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* DAC Verification Modal */}
            {dacModal.open && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '24px', padding: '36px',
                        width: '100%', maxWidth: '440px', margin: '16px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)', position: 'relative'
                    }}>
                        <button onClick={closeDacModal} style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px'
                        }}>
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '20px',
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
                            }}>
                                <Shield size={28} color="white" />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>
                                Verify Delivery
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                                Enter the 6-digit DAC code provided by the buyer to confirm delivery.
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                value={dacInput}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setDacInput(val);
                                    setDacError('');
                                }}
                                placeholder="000000"
                                maxLength={6}
                                style={{
                                    width: '100%', padding: '16px', fontSize: '32px', fontFamily: 'monospace',
                                    textAlign: 'center', letterSpacing: '12px', fontWeight: '800',
                                    border: `2px solid ${dacError ? '#ef4444' : '#e2e8f0'}`,
                                    borderRadius: '16px', outline: 'none', color: '#1e293b',
                                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                                    background: '#f8fafc'
                                }}
                                onFocus={(e) => e.target.style.borderColor = dacError ? '#ef4444' : '#4f46e5'}
                                onBlur={(e) => e.target.style.borderColor = dacError ? '#ef4444' : '#e2e8f0'}
                                autoFocus
                            />
                            {dacError && (
                                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', textAlign: 'center', fontWeight: '500' }}>
                                    {dacError}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleVerifyDAC}
                            disabled={dacLoading || dacInput.length !== 6}
                            style={{
                                width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700',
                                backgroundColor: dacLoading || dacInput.length !== 6 ? '#94a3b8' : '#4f46e5',
                                color: 'white', border: 'none', borderRadius: '14px',
                                cursor: dacLoading || dacInput.length !== 6 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '8px',
                                boxShadow: dacLoading || dacInput.length !== 6 ? 'none' : '0 4px 12px rgba(79,70,229,0.3)'
                            }}
                        >
                            {dacLoading ? (
                                <>
                                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Confirm Delivery
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
