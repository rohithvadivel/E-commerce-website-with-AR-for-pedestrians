import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL, { getImageUrl } from '../config/api';
import { Clock, CheckCircle, XCircle, Upload, AlertTriangle } from 'lucide-react';

const MyProducts = () => {
    const { token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRef = useRef(null);
    const selectedProductRef = useRef(null);

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

    const isBrokenImage = (url) => {
        if (!url) return true;
        // Cloudinary URLs are persistent and valid
        if (url.includes('res.cloudinary.com')) return false;
        // Old local/localhost URLs are broken on Render
        if (url.includes('/uploads/') || url.includes('localhost')) return true;
        return false;
    };

    const handleReuploadClick = (productId) => {
        selectedProductRef.current = productId;
        fileInputRef.current.click();
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedProductRef.current) return;

        const productId = selectedProductRef.current;
        setUploadingId(productId);

        try {
            // Step 1: Upload image to Cloudinary
            const formData = new FormData();
            formData.append('image', file);
            const uploadRes = await axios.post(`${API_BASE_URL}/api/products/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
            });

            // Step 2: Update product with new Cloudinary URL
            const newImageUrl = uploadRes.data.filePath;
            await axios.put(`${API_BASE_URL}/api/products/${productId}/update-image`,
                { image: newImageUrl },
                { headers: { 'x-auth-token': token } }
            );

            // Step 3: Update local state
            setProducts(prev => prev.map(p =>
                p._id === productId ? { ...p, image: newImageUrl } : p
            ));
            alert('Image updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update image');
        } finally {
            setUploadingId(null);
            selectedProductRef.current = null;
            e.target.value = '';
        }
    };

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
            {/* Hidden file input for re-upload */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelected}
                style={{ display: 'none' }}
            />
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
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id}>
                                    <td>
                                        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                                            <img src={getImageUrl(p.image)} alt={p.title} className="w-12 h-12 object-cover rounded"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                            <div style={{ display: 'none', width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                                <AlertTriangle size={20} color="#d97706" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-semibold text-gray-900">{p.title}</td>
                                    <td className="text-green-600 font-bold">₹{p.price}</td>
                                    <td className="text-gray-700">{p.quantity}</td>
                                    <td>{getStatusBadge(p.status)}</td>
                                    <td>
                                        {isBrokenImage(p.image) ? (
                                            <button
                                                onClick={() => handleReuploadClick(p._id)}
                                                disabled={uploadingId === p._id}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    backgroundColor: uploadingId === p._id ? '#fbbf24' : '#f59e0b',
                                                    color: 'white', padding: '6px 12px', borderRadius: '8px',
                                                    fontSize: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer'
                                                }}
                                            >
                                                <Upload size={12} />
                                                {uploadingId === p._id ? 'Uploading...' : 'Re-upload'}
                                            </button>
                                        ) : (
                                            <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>✓ OK</span>
                                        )}
                                    </td>
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

