import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { CreditCard, Smartphone, Building, Wallet, ArrowLeft, CheckCircle, Lock, Plus, X, MapPin, Navigation } from 'lucide-react';
import API_BASE_URL, { getImageUrl } from '../config/api';

const Checkout = () => {
    const { cartItems, getTotal, clearCart } = useCart();
    const { token, user, loadUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [finalAmount, setFinalAmount] = useState(0);

    // Address selection
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    // Auto Location State
    const [isLocating, setIsLocating] = useState(false);

    // OTP States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const platformFee = Math.round(getTotal() * 0.03);
    const totalAmount = getTotal() + platformFee;

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
        { id: 'upi', name: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
        { id: 'netbanking', name: 'Net Banking', icon: Building, desc: 'All major banks supported' },
        { id: 'wallet', name: 'Wallet', icon: Wallet, desc: 'Paytm, Amazon Pay, Mobikwik' },
    ];

    // Load Razorpay SDK
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Auto-select default or first address if available
    useEffect(() => {
        if (user?.addresses?.length > 0 && !selectedAddress && !showNewAddressForm) {
            const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setSelectedAddress(defaultAddr._id);
        }
    }, [user]);

    const handlePayment = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (!selectedAddress && !showNewAddressForm) {
            alert('Please select a delivery address');
            return;
        }

        setIsProcessing(true);

        try {
            // Verify the token belongs to the current user before placing order
            const verifyRes = await axios.get(`${API_BASE_URL}/api/auth`, {
                headers: { 'x-auth-token': token }
            });
            const tokenUser = verifyRes.data;
            console.log('🔑 Token belongs to:', tokenUser.name, tokenUser.email, tokenUser.role);

            if (user && tokenUser.email !== user.email) {
                alert('Session mismatch detected. Please log out and log back in.');
                setIsProcessing(false);
                return;
            }

            if (tokenUser.role !== 'buyer') {
                alert(`You are logged in as a ${tokenUser.role} (${tokenUser.email}). Only buyers can place orders. Please log in with your buyer account.`);
                setIsProcessing(false);
                return;
            }

            let finalShippingAddress = null;

            if (showNewAddressForm) {
                alert("Please save your new address first.");
                setIsProcessing(false);
                return;
            } else {
                // Find the selected address from existing addresses
                finalShippingAddress = user.addresses.find(a => a._id === selectedAddress);
            }

            if (!finalShippingAddress) {
                alert("Failed to process shipping address.");
                setIsProcessing(false);
                return;
            }

            await finalizeCheckout(finalShippingAddress);

        } catch (err) {
            console.error('Payment Error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message || 'Unknown error';
            alert(`Payment failed: ${errorMessage}`);
            setIsProcessing(false);
        }
    };

    const handleSaveAddressOnly = async () => {
        // Basic validation
        if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            alert("Please fill in all required address fields. Name and Phone are mandatory.");
            return;
        }

        // OTP verification removed per user request. Proceed directly to save address.
        await executeAddressSave();
    };

    const executeAddressSave = async () => {
        try {
            setSavingAddress(true);
            const addressRes = await axios.post(`${API_BASE_URL}/api/profile/address`, newAddress, {
                headers: { 'x-auth-token': token }
            });

            // The API returns the updated addresses array. Extract the newly added address
            const updatedAddresses = addressRes.data;
            const finalShippingAddress = updatedAddresses[updatedAddresses.length - 1];

            // Refresh user data globally in context to make the new address show up immediately
            await loadUser();

            setSavingAddress(false);
            // Successfully saved! Hide new address form and select the new address
            setShowNewAddressForm(false);
            setSelectedAddress(finalShippingAddress._id);
        } catch (err) {
            console.error('Save Address Error:', err);
            alert("Failed to save the new address. Please try again.");
            setIsProcessing(false);
            setSavingAddress(false);
        }
    };

    const finalizeCheckout = async (finalShippingAddress) => {
        try {
            // Mock payment processing - simulate 2 second delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order in backend (mock payment confirmed)
            await axios.post(`${API_BASE_URL}/api/payment/mock-confirm`, {
                cartItems,
                totalAmount,
                paymentMethod,
                shippingAddress: finalShippingAddress
            }, {
                headers: { 'x-auth-token': token }
            });

            setFinalAmount(totalAmount);
            setOrderComplete(true);
            clearCart();
            setIsProcessing(false);
        } catch (err) {
            console.error('Payment Error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.msg || err.message || 'Unknown error';
            alert(`Payment failed: ${errorMessage}`);
            setIsProcessing(false);
        }
    };



    const handleAutoLocate = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Using OpenStreetMap Nominatim for reverse geocoding
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    if (response.data && response.data.address) {
                        const addr = response.data.address;

                        // Extract best possible matches
                        const city = addr.city || addr.town || addr.village || addr.county || '';
                        const state = addr.state || '';
                        const pincode = addr.postcode || '';

                        // Build Address Line 1 from available smaller components
                        const line1Components = [
                            addr.house_number,
                            addr.road,
                            addr.suburb || addr.neighbourhood
                        ].filter(Boolean).join(', ');

                        setNewAddress(prev => ({
                            ...prev,
                            city,
                            state,
                            pincode,
                            addressLine1: line1Components || response.data.display_name.split(',')[0],
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching location data:", error);
                    alert("Failed to retrieve address details from your location.");
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to access your location. Please check browser permissions.");
                setIsLocating(false);
            },
            { timeout: 10000 }
        );
    };

    if (cartItems.length === 0 && !orderComplete) {
        navigate('/cart');
        return null;
    }

    if (orderComplete) {
        return (
            <div className="page-light min-h-screen pt-24">
                <div className="container max-w-lg mx-auto text-center py-16">
                    <div className="card-white">
                        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                        <p className="text-gray-600 mb-6">
                            Thank you for your purchase. A confirmation email has been sent to your registered email.
                        </p>
                        <p className="text-lg font-semibold text-amber-600 mb-6">
                            Total Paid: ₹{finalAmount}
                        </p>
                        <button
                            onClick={() => navigate('/buyer')}
                            className="btn-gold"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-light min-h-screen pt-24 pb-12">
            <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
                <button
                    onClick={() => navigate('/cart')}
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
                    <ArrowLeft size={20} /> Back to Cart
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap' }}>

                    {/* Left Column (Address + Payment) */}
                    <div style={{ flex: '1 1 400px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* 1. Delivery Address Section */}
                        <div className="card-white">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-amber-500" />
                                Delivery Address
                            </h3>

                            {!showNewAddressForm ? (
                                <div>
                                    {user?.addresses?.length > 0 ? (
                                        <div className="space-y-3 mb-4">
                                            {user.addresses.map(address => (
                                                <label
                                                    key={address._id}
                                                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedAddress === address._id
                                                        ? 'border-amber-500 bg-amber-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="deliveryAddress"
                                                        className="mt-1 text-amber-500"
                                                        checked={selectedAddress === address._id}
                                                        onChange={() => setSelectedAddress(address._id)}
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900">{address.fullName}</span>
                                                            <span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-medium">
                                                                {address.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {address.addressLine1}
                                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {address.city}, {address.state} - {address.pincode}
                                                        </p>
                                                        <p className="text-sm text-gray-600 font-medium">Phone: {address.phone}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 mb-4 text-sm">You have no saved addresses.</p>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowNewAddressForm(true);
                                            setSelectedAddress(null);
                                        }}
                                        className="flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition"
                                    >
                                        <Plus size={18} /> Add New Address
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-gray-900">Add New Address</h4>
                                        {user?.addresses?.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setShowNewAddressForm(false);
                                                    if (user.addresses.length > 0) {
                                                        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
                                                        setSelectedAddress(defaultAddr._id);
                                                    }
                                                }}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAutoLocate}
                                        disabled={isLocating}
                                        className="w-full mb-4 py-2 border border-amber-500 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                    >
                                        <Navigation size={16} className={isLocating ? "animate-pulse" : ""} />
                                        {isLocating ? "Locating..." : "Use my current location"}
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Full Name *"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.fullName}
                                                onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="tel"
                                                placeholder="Phone Number *"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.phone}
                                                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Address Line 1"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.addressLine1}
                                                onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Address Line 2 (Optional)"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.addressLine2}
                                                onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.city}
                                                onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="State"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.state}
                                                onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <input
                                                type="text"
                                                placeholder="Pincode"
                                                className="form-input-light text-sm p-2 w-full border rounded"
                                                value={newAddress.pincode}
                                                onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Lock size={12} /> This address will be securely saved to your profile.
                                    </p>

                                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={handleSaveAddressOnly}
                                            disabled={savingAddress}
                                            style={{
                                                flex: 1,
                                                padding: '12px 24px',
                                                background: 'linear-gradient(to right, #f59e0b, #d97706)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: savingAddress ? 'not-allowed' : 'pointer',
                                                opacity: savingAddress ? 0.7 : 1
                                            }}
                                        >
                                            {savingAddress ? 'Saving...' : 'Save & Use This Address'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewAddressForm(false);
                                                if (user?.addresses?.length > 0) {
                                                    const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
                                                    setSelectedAddress(defaultAddr._id);
                                                }
                                            }}
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: '#f1f5f9',
                                                color: '#64748b',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Payment Methods Section */}
                        <div className="card-white">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>

                            <div className="space-y-3">
                                {paymentMethods.map(method => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === method.id
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-amber-500"
                                        />
                                        <method.icon size={24} className={paymentMethod === method.id ? 'text-amber-600' : 'text-gray-400'} />
                                        <div>
                                            <p className="font-medium text-gray-900">{method.name}</p>
                                            <p className="text-sm text-gray-500">{method.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="form-label">Card Number</label>
                                        <input type="text" placeholder="1234 5678 9012 3456" className="form-input-light" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" className="form-input-light" />
                                        </div>
                                        <div>
                                            <label className="form-label">CVV</label>
                                            <input type="text" placeholder="123" className="form-input-light" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'upi' && (
                                <div className="mt-6">
                                    <label className="form-label">UPI ID</label>
                                    <input type="text" placeholder="yourname@upi" className="form-input-light" />
                                </div>
                            )}

                            {/* Pay Button - Always visible */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-4 mt-6">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{totalAmount}</span>
                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 24px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        border: 'none',
                                        cursor: (isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm)) ? 'not-allowed' : 'pointer',
                                        background: (isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm))
                                            ? '#d1d5db'
                                            : 'linear-gradient(to right, #f59e0b, #d97706)',
                                        color: (isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm)) ? '#6b7280' : 'white',
                                        boxShadow: (isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm))
                                            ? 'none'
                                            : '0 10px 25px rgba(245, 158, 11, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isProcessing || savingAddress ? (
                                        <>{savingAddress ? 'Saving Address...' : 'Processing...'}</>
                                    ) : (
                                        <>
                                            <Lock size={20} /> Pay ₹{totalAmount}
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-4">
                                    <Lock size={14} />
                                    <span>Secure 256-bit SSL encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="card-white lg:sticky lg:top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                            <div className="max-h-48 overflow-y-auto mb-4">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                                        <img src={getImageUrl(item.image)} alt={item.title} className="w-12 h-12 object-cover rounded" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                                            <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 mb-4 pt-4 border-t">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{getTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee (3%)</span>
                                    <span>₹{platformFee}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm)}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${(isProcessing || savingAddress || !paymentMethod || (!selectedAddress && !showNewAddressForm))
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                                    }`}
                            >
                                {isProcessing || savingAddress ? (
                                    <>{savingAddress ? 'Saving Address...' : 'Processing...'}</>
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay ₹{totalAmount}
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-4">
                                <Lock size={14} />
                                <span>Secure 256-bit SSL encryption</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Checkout;
