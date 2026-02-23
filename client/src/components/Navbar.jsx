import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LogOut, Menu, X, ShoppingBag, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout, role, isAuthenticated, loading } = useContext(AuthContext);
    const { getItemCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const itemCount = getItemCount();

    // Hide navbar on login/signup pages for cleaner look
    if (['/login', '/signup'].includes(location.pathname)) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to={role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/buyer'} className="navbar-brand">
                    <ShoppingBag className="navbar-brand-icon" />
                    <span className="navbar-brand-text">Artistry</span>
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated && (
                        <div className="navbar-user">
                            {/* View Cart & My Orders - Only visible for buyers */}
                            {role === 'buyer' && !location.pathname.startsWith('/seller') && !location.pathname.startsWith('/admin') && (
                                <>
                                    <Link to="/cart" className="navbar-view-cart">
                                        <ShoppingCart size={18} />
                                        <span>View Cart</span>
                                        {itemCount > 0 && (
                                            <span className="navbar-view-cart-badge">{itemCount}</span>
                                        )}
                                    </Link>
                                    <Link to="/my-orders" className="navbar-view-cart">
                                        <ClipboardList size={18} />
                                        <span>My Orders</span>
                                    </Link>
                                </>
                            )}

                            {/* Profile Link - Only for buyers and sellers */}
                            {role !== 'admin' && !location.pathname.startsWith('/admin') && (
                                <Link
                                    to="/profile"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 14px',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        textDecoration: 'none',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <User size={18} />
                                    Profile
                                </Link>
                            )}

                            <span className="navbar-welcome">
                                Welcome, <span className="navbar-username">{user?.name || (loading ? 'Artist' : 'User')}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="navbar-logout"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button section */}
                <div className="navbar-mobile-actions">
                    {isAuthenticated && role === 'buyer' && !location.pathname.startsWith('/seller') && !location.pathname.startsWith('/admin') && (
                        <Link to="/cart" className="navbar-cart">
                            <ShoppingCart size={22} />
                            {itemCount > 0 && (
                                <span className="navbar-cart-badge">{itemCount}</span>
                            )}
                        </Link>
                    )}
                    <button onClick={() => setIsOpen(!isOpen)} className="navbar-mobile-toggle">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && isAuthenticated && (
                <div className="navbar-mobile-menu">
                    <span className="navbar-mobile-user">Hi, {user?.name || (loading ? 'Artist' : 'User')}</span>
                    {role === 'buyer' && !location.pathname.startsWith('/seller') && !location.pathname.startsWith('/admin') && (
                        <Link to="/cart" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
                            <ShoppingCart size={18} /> View Cart ({itemCount})
                        </Link>
                    )}
                    {role === 'buyer' && !location.pathname.startsWith('/seller') && !location.pathname.startsWith('/admin') && (
                        <Link to="/my-orders" onClick={() => setIsOpen(false)} className="navbar-mobile-link">
                            <ClipboardList size={18} /> My Orders
                        </Link>
                    )}
                    <button onClick={handleLogout} className="navbar-mobile-logout">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
