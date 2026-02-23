import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Package, Tag, Info, List, Image as ImageIcon, Upload, CheckCircle, Box, Layers } from 'lucide-react';
import API_BASE_URL from '../config/api';

const AddProduct = () => {
    const { token } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        productType: '',
        price: '',
        quantity: '',
        description: '',
        image: '',
        model3D: ''
    });
    const [file, setFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingModel, setUploadingModel] = useState(false);
    const [message, setMessage] = useState('');

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleModelFileChange = (e) => {
        setModelFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first");
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/products/upload`, formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            });
            setFormData(prev => ({ ...prev, image: `${API_BASE_URL}` + res.data.filePath }));
            alert('Image Uploaded!');
        } catch (err) {
            console.error(err);
            alert('Upload Failed');
        } finally {
            setUploading(false);
        }
    };

    const handleModelUpload = async () => {
        if (!modelFile) return alert("Please select a 3D model file first");
        setUploadingModel(true);
        const formDataUpload = new FormData();
        formDataUpload.append('model', modelFile);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/products/upload-model`, formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            });
            setFormData(prev => ({ ...prev, model3D: `${API_BASE_URL}` + res.data.filePath }));
            alert('3D Model Uploaded!');
        } catch (err) {
            console.error(err);
            alert('3D Model Upload Failed');
        } finally {
            setUploadingModel(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/products`, formData, {
                headers: { 'x-auth-token': token }
            });
            setMessage('Product Added Successfully!');
            setFormData({ title: '', productType: '', price: '', quantity: '', image: '', description: '', model3D: '' });
            setFile(null);
            setModelFile(null);
        } catch (err) {
            console.error(err);
            setMessage('Error adding product');
        }
    };

    return (
        <div className="card-white slide-in-from-bottom-5 animate-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <Package size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
                    <p className="text-sm text-gray-500">List a new masterpiece in the market</p>
                </div>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700">
                    <CheckCircle size={20} />
                    <span className="font-medium">{message}</span>
                </div>
            )}

            {/* Image Upload */}
            <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="form-label mb-3 flex items-center gap-2">
                    <ImageIcon size={18} className="text-gray-400" />
                    Product Image <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            id="file-upload"
                        />
                        <div className="form-input-light flex items-center justify-between py-2 px-4 bg-white">
                            <span className="text-gray-500 truncate">
                                {file ? file.name : 'Choose elegant artwork...'}
                            </span>
                            <Upload size={18} className="text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={handleUpload}
                        type="button"
                        disabled={uploading || !file}
                        className={`btn-blue flex items-center justify-center gap-2 min-w-[120px] ${uploading || !file ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                {formData.image && (
                    <div className="mt-4 relative group" style={{ width: '120px', height: '120px' }}>
                        <img src={formData.image} alt="Preview" className="rounded-xl shadow-md border-2 border-white" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>

            {/* 3D Model Upload (Optional) */}
            <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <label className="form-label mb-3 flex items-center gap-2">
                    <Box size={18} className="text-indigo-500" />
                    3D Model <span className="text-gray-400 text-sm font-normal">(Optional - for AR view)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">Upload a .glb or .gltf file for 3D AR viewing</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={handleModelFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            id="model-upload"
                        />
                        <div className="form-input-light flex items-center justify-between py-2 px-4 bg-white">
                            <span className="text-gray-500 truncate">
                                {modelFile ? modelFile.name : 'Choose 3D model file...'}
                            </span>
                            <Upload size={18} className="text-indigo-400" />
                        </div>
                    </div>
                    <button
                        onClick={handleModelUpload}
                        type="button"
                        disabled={uploadingModel || !modelFile}
                        style={{
                            backgroundColor: uploadingModel || !modelFile ? '#a5b4fc' : '#4f46e5',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            minWidth: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            cursor: uploadingModel || !modelFile ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {uploadingModel ? 'Uploading...' : 'Upload 3D'}
                    </button>
                </div>
                {formData.model3D && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">3D Model uploaded successfully!</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="form-label flex items-center gap-2">
                        <Tag size={18} className="text-gray-400" />
                        Artwork Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        placeholder="e.g. Ethereal Dreams at Dusk"
                        value={formData.title}
                        onChange={onChange}
                        className="form-input-light"
                        required
                    />
                </div>

                <div>
                    <label className="form-label flex items-center gap-2">
                        <Layers size={18} className="text-gray-400" />
                        Product Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="productType"
                        value={formData.productType}
                        onChange={onChange}
                        className="form-input-light"
                        required
                        style={{
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 14px center',
                            paddingRight: '36px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="" disabled>Select a category...</option>
                        <option value="electronics">🖥️ Electronics</option>
                        <option value="furniture">🪑 Furniture</option>
                        <option value="painting">🎨 Painting</option>
                        <option value="drawings">✏️ Drawings</option>
                    </select>
                </div>

                <div>
                    <label className="form-label flex items-center gap-2">
                        <Info size={18} className="text-gray-400" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows="4"
                        placeholder="Tell the story behind this piece..."
                        value={formData.description}
                        onChange={onChange}
                        className="form-input-light resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="form-label flex items-center gap-2">
                            <span className="text-gray-400 font-serif font-bold text-lg">₹</span>
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={onChange}
                            className="form-input-light"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label flex items-center gap-2">
                            <List size={18} className="text-gray-400" />
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            placeholder="1"
                            value={formData.quantity}
                            onChange={onChange}
                            className="form-input-light"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn-green w-full py-4 text-lg shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transform active:scale-[0.98] transition-all">
                    List Masterpiece
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
