import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { getImageUrl } from '../config/api';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotal, getItemCount } = useCart();
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="page-light min-h-screen pt-24">
                <div className="container">
                    <div className="text-center py-16">
                        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">Browse our collection and add some amazing art!</p>
                        <button
                            onClick={() => navigate('/buyer')}
                            className="btn-gold"
                        >
                            Browse Gallery
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleCheckout = () => {
        if (!isAuthenticated) {
            alert('Please login to proceed to checkout');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="page-light min-h-screen pt-24">
            <div className="container">
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '24px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.target.style.backgroundColor = '#e2e8f0'; }}
                    onMouseOut={(e) => { e.target.style.backgroundColor = '#f1f5f9'; }}
                >
                    <ArrowLeft size={20} /> Continue Shopping
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({getItemCount()} items)</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 lg:flex-[2]">
                        <div className="card-white">
                            {cartItems.map(item => (
                                <div key={item._id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.title}
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-gray-500 text-sm">By {item.seller?.name || 'Artist'}</p>
                                        <p className="text-lg font-bold text-amber-600 mt-1">₹{item.price}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="p-2 hover:bg-gray-200 rounded-l-lg"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="p-2 hover:bg-gray-200 rounded-r-lg"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="card-white sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{getTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee (3%)</span>
                                    <span>₹{Math.round(getTotal() * 0.03)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{getTotal() + Math.round(getTotal() * 0.03)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn-gold w-full"
                            >
                                Proceed to Checkout
                            </button>

                            <p className="text-center text-gray-500 text-sm mt-4">
                                Secure checkout powered by Artistry
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
