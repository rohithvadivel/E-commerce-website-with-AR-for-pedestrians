import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ARView from '../components/ARView';
import ModelViewer from '../components/ModelViewer';
import { ArrowLeft, ShoppingCart, Camera, Star, Plus, Check, Box } from 'lucide-react';
import API_BASE_URL, { getImageUrl } from '../config/api';

const ProductDetails = () => {
    const { id } = useParams();
    const { token } = useContext(AuthContext);
    const { addToCart, cartItems } = useCart();
    const [product, setProduct] = useState(null);
    const [showAR, setShowAR] = useState(false);
    const [show3D, setShow3D] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const navigate = useNavigate();

    const isInCart = cartItems.some(item => item._id === id);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products`);
                const found = res.data.find(p => p._id === id);
                setProduct(found);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        addToCart(product);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        addToCart(product);
        navigate('/checkout');
    };

    if (!product) return <div className="min-h-screen flex items-center justify-center pt-20 text-gray-500">Loading...</div>;

    return (
        <div className="product-details-page">
            {showAR && <ARView imageSrc={getImageUrl(product.image)} onClose={() => setShowAR(false)} />}
            {show3D && product.model3D && (
                <ModelViewer
                    modelSrc={product.model3D}
                    posterSrc={getImageUrl(product.image)}
                    productTitle={product.title}
                    onClose={() => setShow3D(false)}
                />
            )}

            <div className="container py-8">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={20} /> Back to Gallery
                </button>

                <div className="product-details-grid">
                    <div>
                        <div className="product-image-container">
                            <img src={getImageUrl(product.image)} alt={product.title} />
                            {product.model3D && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <Box size={14} />
                                    3D Available
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="product-badges">
                            <span className="product-badge">Original Art</span>
                            {product.offerPercentage > 0 && (
                                <span style={{
                                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700'
                                }}>
                                    {product.offerPercentage}% OFF
                                </span>
                            )}
                            <div className="product-rating">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                        </div>

                        <h1 className="product-details-title">{product.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <p className="product-details-price" style={{ margin: 0 }}>₹{product.price}</p>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <span style={{
                                    textDecoration: 'line-through',
                                    color: '#9ca3af',
                                    fontSize: '1.2rem',
                                    fontWeight: '400'
                                }}>
                                    ₹{product.originalPrice}
                                </span>
                            )}
                            {product.offerPercentage > 0 && (
                                <span style={{
                                    color: '#16a34a',
                                    fontSize: '1rem',
                                    fontWeight: '600'
                                }}>
                                    {product.offerPercentage}% off
                                </span>
                            )}
                        </div>

                        <div className="product-description">
                            <p>{product.description || 'A stunning piece of original artwork, perfect for modern living spaces. Authenticated by Artistry.'}</p>
                        </div>

                        <div className="product-actions">
                            {product.model3D ? (
                                <button
                                    onClick={() => setShow3D(true)}
                                    className="action-btn-secondary"
                                    style={{ backgroundColor: '#eef2ff', borderColor: '#4f46e5', color: '#4f46e5' }}
                                >
                                    <Box size={20} /> View in 3D / AR
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowAR(true)}
                                    className="action-btn-secondary"
                                >
                                    <Camera size={20} /> View in Room
                                </button>
                            )}
                            <button
                                onClick={isInCart ? () => navigate('/cart') : handleAddToCart}
                                className={`action-btn-secondary ${addedToCart || isInCart ? 'bg-green-100 border-green-500 text-green-700' : ''}`}
                                disabled={addedToCart && !isInCart}
                            >
                                {addedToCart || isInCart ? (
                                    <><Check size={20} /> View Cart</>
                                ) : (
                                    <><Plus size={20} /> Add to Cart</>
                                )}
                            </button>
                        </div>

                        <button
                            onClick={handleBuyNow}
                            className="action-btn-primary w-full mt-4"
                        >
                            <ShoppingCart size={20} /> Buy Now
                        </button>

                        <p className="product-disclaimer">
                            * Includes Certificate of Authenticity & 30-day returns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
