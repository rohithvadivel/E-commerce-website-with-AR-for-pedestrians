import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../config/api';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems } = useCart();
    const [justAdded, setJustAdded] = useState(false);
    const navigate = useNavigate();

    const isInCart = cartItems.some(item => item._id === product._id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
    };

    const handleViewCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/cart');
    };

    return (
        <Link to={`/buyer/product/${product._id}`} className="product-card group">
            <div className="product-card-image" style={{ position: 'relative' }}>
                <img
                    src={getImageUrl(product.image)}
                    alt={product.title}
                    className="product-card-img"
                />
                {product.offerPercentage > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'linear-gradient(135deg, #16a34a, #15803d)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                        zIndex: 2
                    }}>
                        {product.offerPercentage}% OFF
                    </div>
                )}
                <div className="product-card-overlay">
                    <button
                        onClick={isInCart ? handleViewCart : handleAddToCart}
                        className={`product-card-btn ${justAdded || isInCart ? 'product-card-btn-success' : ''}`}
                    >
                        {justAdded || isInCart ? (
                            <>
                                <Check size={16} />
                                View Cart
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="product-card-content">
                <h3 className="product-card-title">{product.title}</h3>
                <p className="product-card-seller">By Seller {product.seller?.name || 'Artist'}</p>
                <div className="product-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="product-card-price">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span style={{
                                textDecoration: 'line-through',
                                color: '#9ca3af',
                                fontSize: '0.85rem',
                                fontWeight: '400'
                            }}>
                                ₹{product.originalPrice}
                            </span>
                        )}
                        {product.offerPercentage > 0 && (
                            <span style={{
                                color: '#16a34a',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                {product.offerPercentage}% off
                            </span>
                        )}
                    </div>
                    <span className="product-card-stock">
                        {product.quantity} left
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
