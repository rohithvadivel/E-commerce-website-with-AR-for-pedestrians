import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const FloatingCartButton = () => {
    const { getItemCount } = useCart();
    const navigate = useNavigate();
    const itemCount = getItemCount();

    return (
        <button
            onClick={() => navigate('/cart')}
            className="floating-cart-btn"
        >
            <ShoppingCart size={22} />
            <span>View Cart</span>
            {itemCount > 0 && (
                <span className="floating-cart-badge">{itemCount}</span>
            )}
        </button>
    );
};

export default FloatingCartButton;
