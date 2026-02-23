import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL, { getImageUrl } from '../config/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const MyProducts = () => {
    const { token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/myproducts`, {
                    headers: { 'x-auth-token': token }
                });
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, [token]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        <CheckCircle size={12} />
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        <XCircle size={12} />
                        Rejected
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                        <Clock size={12} />
                        Pending
                    </span>
                );
        }
    };

    return (
        <div className="card-white">
            <h3 className="text-xl font-bold mb-4 text-gray-900">My Inventory</h3>
            {products.length === 0 ? <p className="text-gray-600">No products listed yet.</p> : (
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id}>
                                    <td><img src={getImageUrl(p.image)} alt={p.title} className="w-12 h-12 object-cover rounded" /></td>
                                    <td className="font-semibold text-gray-900">{p.title}</td>
                                    <td className="text-green-600 font-bold">₹{p.price}</td>
                                    <td className="text-gray-700">{p.quantity}</td>
                                    <td>{getStatusBadge(p.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyProducts;

