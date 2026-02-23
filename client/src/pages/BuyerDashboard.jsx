import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Sparkles, ArrowRight } from 'lucide-react';
import API_BASE_URL from '../config/api';

const BuyerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products`);
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="page-light-full min-h-screen bg-[#f8fafc]">
            {/* Hero Section - Premium Art Market Vibe */}
            <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
                <img
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80"
                    alt="Art Gallery Backdrop"
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-900 via-slate-900/40" />

                <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-widest border border-gold/20 backdrop-blur-md">
                            <Sparkles size={14} />
                            Premier Art Collective
                        </span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-6xl mb-6">
                        Discover Unique <span className="text-gold italic">Masterpieces</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg leading-8 text-gray-300 mb-10">
                        Explore a curated collection of augmented reality-ready artwork. Bring the gallery into your home, virtually and physically.
                    </p>

                    <div className="max-w-2xl mx-auto relative group mt-8">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:bg-white/15 transition-all text-lg shadow-2xl"
                            placeholder="Search by artist, style or collection..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Curated Selection</h2>
                        <div className="h-1 w-12 bg-gold rounded-full" />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all shadow-sm">
                        <Filter size={18} />
                        Refine Search
                    </button>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {filteredProducts.map((product, idx) => (
                            <div key={product._id} className="animate-in fade-in slide-in-from-bottom-5" style={{ animationDelay: `${idx * 50}ms`, animationDuration: '600ms' }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
                        <div className="p-4 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No art matches your search</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">Try adjusting your filters or search terms to find what you're looking for.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                        >
                            View all collections <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDashboard;
