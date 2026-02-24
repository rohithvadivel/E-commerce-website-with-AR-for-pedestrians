import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { IndianRupee, Package, TrendingUp, Truck, ShoppingBag, BarChart3, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import API_BASE_URL, { getImageUrl } from '../config/api';

const CATEGORY_COLORS = {
    electronics: { bg: '#dbeafe', color: '#2563eb', label: '🖥️ Electronics' },
    furniture: { bg: '#fef3c7', color: '#d97706', label: '🪑 Furniture' },
    painting: { bg: '#fce7f3', color: '#db2777', label: '🎨 Painting' },
    drawings: { bg: '#e0e7ff', color: '#4f46e5', label: '✏️ Drawings' },
    unknown: { bg: '#f1f5f9', color: '#64748b', label: '📦 Other' }
};

const BAR_COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706'];

const SellerInsights = ({ orders, products, loading }) => {
    console.log("INSIGHTS DATA:", { orders, products, loading });
    // ── Computed analytics ──
    const stats = useMemo(() => {
        let totalRevenue = 0;

        orders.forEach(o => {
            if (o && o.products) {
                o.products.forEach(p => {
                    if (p && p.product && typeof p.product.price === 'number') {
                        totalRevenue += p.product.price * (p.quantity || 1);
                    }
                });
            }
        });

        const totalOrders = orders.length;
        const deliveredOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;
        const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

        const approvedProducts = products.filter(p => p.status === 'approved').length;
        const pendingProducts = products.filter(p => p.status === 'pending').length;
        const rejectedProducts = products.filter(p => p.status === 'rejected').length;

        return { totalRevenue, totalOrders, deliveryRate, deliveredOrders, approvedProducts, pendingProducts, rejectedProducts, totalProducts: products.length };
    }, [orders, products]);

    // ── Monthly revenue (last 6 months) ──
    const monthlyRevenue = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${d.getMonth()}`,
                label: d.toLocaleString('en-IN', { month: 'short' }),
                year: d.getFullYear(),
                month: d.getMonth(),
                revenue: 0
            });
        }
        orders.forEach(o => {
            if (!o || !o.products || !o.createdAt) return;

            const date = new Date(o.createdAt);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const m = months.find(mo => mo.key === key);

            if (m) {
                o.products.forEach(p => {
                    if (p && p.product && typeof p.product.price === 'number') {
                        m.revenue += p.product.price * (p.quantity || 1);
                    }
                });
            }
        });
        return months;
    }, [orders]);

    const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

    // ── Category breakdown ──
    const categoryBreakdown = useMemo(() => {
        const map = {};
        products.forEach(p => {
            const type = p.productType || 'unknown';
            if (!map[type]) map[type] = { count: 0, revenue: 0 };
            map[type].count++;
        });
        // Add revenue from orders
        orders.forEach(o => {
            if (!o || !o.products) return;
            o.products.forEach(op => {
                if (op && op.product) {
                    const type = op.product.productType || 'unknown';
                    if (!map[type]) map[type] = { count: 0, revenue: 0 };
                    map[type].revenue += (op.product.price || 0) * (op.quantity || 1);
                }
            });
        });
        return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
    }, [products, orders]);

    const totalCategoryCount = categoryBreakdown.reduce((s, [, v]) => s + v.count, 0) || 1;

    // ── Top selling products ──
    const topProducts = useMemo(() => {
        const map = {};
        orders.forEach(o => {
            if (!o || !o.products) return;
            o.products.forEach(op => {
                if (op && op.product) {
                    const id = op.product._id;
                    if (!map[id]) map[id] = { ...op.product, soldQty: 0, revenue: 0 };
                    map[id].soldQty += op.quantity || 1;
                    map[id].revenue += (op.product.price || 0) * (op.quantity || 1);
                }
            });
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [orders]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                <p style={{ color: '#6b7280', fontWeight: '600' }}>Loading insights...</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div>
                    <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>Studio Insights</h2>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Track your sales performance and product analytics</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>Live Data</span>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', marginBottom: '28px' }}>
                {/* Revenue */}
                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '20px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.85 }}>
                        <IndianRupee size={16} />
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</span>
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px', fontFamily: 'system-ui' }}>₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>After 3% platform commission</p>
                </div>

                {/* Orders */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748b' }}>
                        <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '10px', color: '#2563eb' }}><ShoppingBag size={16} /></div>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</span>
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>{stats.totalOrders}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{stats.deliveredOrders} delivered</p>
                </div>

                {/* Delivery Rate */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748b' }}>
                        <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '10px', color: '#16a34a' }}><Truck size={16} /></div>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Rate</span>
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>{stats.deliveryRate}%</p>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${stats.deliveryRate}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: '999px', transition: 'width 1s ease' }} />
                    </div>
                </div>

                {/* Products */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748b' }}>
                        <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '10px', color: '#d97706' }}><Package size={16} /></div>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Products</span>
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>{stats.totalProducts}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#166534' }}>{stats.approvedProducts} active</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#92400e' }}>{stats.pendingProducts} pending</span>
                        {stats.rejectedProducts > 0 && <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#991b1b' }}>{stats.rejectedProducts} rejected</span>}
                    </div>
                </div>
            </div>

            {/* ── Charts Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', marginBottom: '28px' }}>
                {/* Monthly Revenue Chart */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <BarChart3 size={18} style={{ color: '#4f46e5' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Monthly Revenue</h3>
                    </div>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            <TrendingUp size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>Revenue data will appear here after your first sale</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', paddingTop: '10px' }}>
                            {monthlyRevenue.map((m, i) => {
                                const height = maxMonthlyRevenue > 0 ? Math.max((m.revenue / maxMonthlyRevenue) * 100, m.revenue > 0 ? 8 : 3) : 3;
                                return (
                                    <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5' }}>
                                            {m.revenue > 0 ? `₹${m.revenue.toLocaleString('en-IN')}` : ''}
                                        </span>
                                        <div
                                            style={{
                                                width: '100%', maxWidth: '48px',
                                                height: `${height}%`,
                                                background: m.revenue > 0 ? `linear-gradient(180deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[i % BAR_COLORS.length]}90)` : '#f1f5f9',
                                                borderRadius: '8px 8px 4px 4px',
                                                transition: 'height 0.8s ease',
                                                minHeight: '4px'
                                            }}
                                        />
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{m.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <Layers size={18} style={{ color: '#7c3aed' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Product Categories</h3>
                    </div>
                    {categoryBreakdown.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            <Package size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>Add products to see category breakdown</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {categoryBreakdown.map(([type, data]) => {
                                const cfg = CATEGORY_COLORS[type] || CATEGORY_COLORS.unknown;
                                const pct = Math.round((data.count / totalCategoryCount) * 100);
                                return (
                                    <div key={type}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{cfg.label}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>{data.count} products</span>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: cfg.color }}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: cfg.color, borderRadius: '999px', transition: 'width 0.8s ease', minWidth: pct > 0 ? '8px' : '0' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Top Selling & Recent Orders ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
                {/* Top Selling Products */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <TrendingUp size={18} style={{ color: '#059669' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Top Selling Products</h3>
                    </div>
                    {topProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            <ShoppingBag size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>Sales data will appear after your first order</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topProducts.map((p, idx) => (
                                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: idx === 0 ? '#fefce8' : '#f8fafc', borderRadius: '14px', border: idx === 0 ? '1px solid #fef08a' : '1px solid transparent' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '13px', fontWeight: '800',
                                        backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : '#e2e8f0',
                                        color: idx < 3 ? '#fff' : '#64748b'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                                        <img src={getImageUrl(p.image)} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{p.soldQty} sold</p>
                                    </div>
                                    <p style={{ fontWeight: '700', color: '#059669', margin: 0, fontSize: '14px', whiteSpace: 'nowrap' }}>₹{p.revenue.toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <ShoppingBag size={18} style={{ color: '#2563eb' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Orders</h3>
                    </div>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            <ShoppingBag size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>No orders yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {orders.slice(0, 5).map(o => (
                                <div key={o._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <div>
                                        <p style={{ fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '14px' }}>{o.buyer?.name || 'Unknown'}</p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {o.products.length} item{o.products.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: '700', color: '#0f172a', margin: 0, fontSize: '14px' }}>₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                                        <span style={{
                                            fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
                                            backgroundColor: o.deliveryStatus === 'Delivered' ? '#dcfce7' : '#fef3c7',
                                            color: o.deliveryStatus === 'Delivered' ? '#166534' : '#92400e'
                                        }}>
                                            {o.deliveryStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

export default SellerInsights;
