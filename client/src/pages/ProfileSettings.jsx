import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
    User, Phone, MapPin, Plus, Edit2, Trash2, Check, X,
    ArrowLeft, Shield, CheckCircle, AlertCircle, Navigation
} from 'lucide-react';
import API_BASE_URL from '../config/api';

const ProfileSettings = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // OTP verification
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Address form
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
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
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/profile`, {
                headers: { 'x-auth-token': token }
            });
            setProfile(res.data);
            setName(res.data.name || '');
            setPhone(res.data.phone || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_BASE_URL}/api/profile`,
                { name, phone },
                { headers: { 'x-auth-token': token } }
            );
            setProfile(res.data);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        }
    };

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/api/profile/send-otp`,
                { phone },
                { headers: { 'x-auth-token': token } }
            );
            setOtpSent(true);
            setShowOtpModal(true);
            alert('OTP sent to your phone!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        setVerifying(true);
        try {
            await axios.post(`${API_BASE_URL}/api/profile/verify-otp`,
                { otp },
                { headers: { 'x-auth-token': token } }
            );
            setShowOtpModal(false);
            setOtp('');
            fetchProfile();
            alert('Phone verified successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            alert("Please fill in all required address fields. Name and Phone are mandatory.");
            return;
        }

        // Proceed directly to save address
        await saveAddress();
    };

    const saveAddress = async () => {
        try {
            if (editingAddress) {
                await axios.put(`${API_BASE_URL}/api/profile/address/${editingAddress}`,
                    addressForm,
                    { headers: { 'x-auth-token': token } }
                );
            } else {
                await axios.post(`${API_BASE_URL}/api/profile/address`,
                    addressForm,
                    { headers: { 'x-auth-token': token } }
                );
            }
            fetchProfile();
            resetAddressForm();
        } catch (err) {
            console.error(err);
            alert('Failed to save address');
        }
    };



    const handleEditAddress = (address) => {
        setEditingAddress(address._id);
        setAddressForm({
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault
        });
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/profile/address/${addressId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchProfile();
        } catch (err) {
            console.error(err);
            alert('Failed to delete address');
        }
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
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
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    if (response.data && response.data.address) {
                        const addr = response.data.address;

                        const city = addr.city || addr.town || addr.village || addr.county || '';
                        const state = addr.state || '';
                        const pincode = addr.postcode || '';

                        const line1Components = [
                            addr.house_number,
                            addr.road,
                            addr.suburb || addr.neighbourhood
                        ].filter(Boolean).join(', ');

                        setAddressForm(prev => ({
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

    if (loading) {
        return (
            <div className="page-light min-h-screen pt-24 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page-light min-h-screen pt-24 pb-12">
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
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
                        marginBottom: '24px'
                    }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: activeTab === 'profile' ? 'linear-gradient(to right, #f59e0b, #d97706)' : '#f1f5f9',
                            color: activeTab === 'profile' ? 'white' : '#64748b'
                        }}
                    >
                        <User size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('addresses')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: activeTab === 'addresses' ? 'linear-gradient(to right, #f59e0b, #d97706)' : '#f1f5f9',
                            color: activeTab === 'addresses' ? 'white' : '#64748b'
                        }}
                    >
                        <MapPin size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        Addresses
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="card-white">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-input-light"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profile?.email || ''}
                                    className="form-input-light"
                                    disabled
                                    style={{ backgroundColor: '#f1f5f9' }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                                    Phone Number
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="form-input-light"
                                        placeholder="Enter 10-digit phone number"
                                        style={{ flex: 1 }}
                                    />
                                    {profile?.phoneVerified ? (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '0 16px',
                                            backgroundColor: '#dcfce7',
                                            color: '#16a34a',
                                            borderRadius: '10px',
                                            fontWeight: '600'
                                        }}>
                                            <CheckCircle size={18} /> Verified
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            style={{
                                                padding: '12px 20px',
                                                backgroundColor: '#1e293b',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Shield size={18} style={{ display: 'inline', marginRight: '6px' }} />
                                            Verify
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    padding: '14px 28px',
                                    background: 'linear-gradient(to right, #f59e0b, #d97706)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                    <div>
                        {!showAddressForm && (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px 24px',
                                    background: 'linear-gradient(to right, #f59e0b, #d97706)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginBottom: '24px'
                                }}
                            >
                                <Plus size={20} /> Add New Address
                            </button>
                        )}

                        {showAddressForm && (
                            <div className="card-white" style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                                    </h3>
                                    <button onClick={resetAddressForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <X size={24} color="#64748b" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAutoLocate}
                                    disabled={isLocating}
                                    className="w-full mb-6 py-2 border border-amber-500 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                >
                                    <Navigation size={16} className={isLocating ? "animate-pulse" : ""} />
                                    {isLocating ? "Locating..." : "Use my current location"}
                                </button>

                                <form onSubmit={handleAddressSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Label</label>
                                            <select
                                                value={addressForm.label}
                                                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                className="form-input-light"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Full Name</label>
                                            <input
                                                type="text"
                                                value={addressForm.fullName}
                                                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                                className="form-input-light"
                                                placeholder="Full Name *"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Phone</label>
                                            <input
                                                type="tel"
                                                value={addressForm.phone}
                                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                className="form-input-light"
                                                placeholder="Phone Number *"
                                                required
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Address Line 1</label>
                                            <input
                                                type="text"
                                                value={addressForm.addressLine1}
                                                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                                className="form-input-light"
                                                placeholder="House/Flat No., Building Name, Street"
                                                required
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Address Line 2</label>
                                            <input
                                                type="text"
                                                value={addressForm.addressLine2}
                                                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                                className="form-input-light"
                                                placeholder="Landmark (Optional)"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>City</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="form-input-light"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>State</label>
                                            <input
                                                type="text"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                className="form-input-light"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>Pincode</label>
                                            <input
                                                type="text"
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                className="form-input-light"
                                                required
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault}
                                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                id="isDefault"
                                            />
                                            <label htmlFor="isDefault" style={{ fontWeight: '500', color: '#374151' }}>Set as default address</label>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '12px 24px',
                                                background: 'linear-gradient(to right, #f59e0b, #d97706)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {editingAddress ? 'Update Address' : 'Save Address'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetAddressForm}
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
                                </form>
                            </div>
                        )}

                        {/* Address List */}
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {profile?.addresses?.length === 0 && !showAddressForm && (
                                <div className="card-white" style={{ textAlign: 'center', padding: '40px' }}>
                                    <MapPin size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ color: '#6b7280' }}>No addresses saved yet</p>
                                </div>
                            )}

                            {profile?.addresses?.map((address) => (
                                <div key={address._id} className="card-white" style={{ position: 'relative' }}>
                                    {address.isDefault && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '16px',
                                            right: '16px',
                                            padding: '4px 12px',
                                            backgroundColor: '#fef3c7',
                                            color: '#b45309',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            Default
                                        </span>
                                    )}
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#475569',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {address.label}
                                        </span>
                                    </div>
                                    <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{address.fullName}</p>
                                    <p style={{ color: '#64748b', marginBottom: '4px' }}>
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p style={{ color: '#64748b', marginBottom: '4px' }}>
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                    <p style={{ color: '#64748b' }}>Phone: {address.phone}</p>

                                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleEditAddress(address)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 16px',
                                                backgroundColor: '#f1f5f9',
                                                color: '#475569',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address._id)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 16px',
                                                backgroundColor: '#fef2f2',
                                                color: '#dc2626',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* OTP Modal */}
                {showOtpModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '400px',
                            width: '90%'
                        }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Verify Phone Number</h3>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>
                                Enter the 6-digit OTP sent to your phone
                            </p>

                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                maxLength={6}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '20px',
                                    textAlign: 'center',
                                    letterSpacing: '8px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    marginBottom: '20px'
                                }}
                            />

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={verifying || otp.length !== 6}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        background: otp.length === 6 ? 'linear-gradient(to right, #f59e0b, #d97706)' : '#d1d5db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: otp.length === 6 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {verifying ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                    onClick={() => { setShowOtpModal(false); setOtp(''); }}
                                    disabled={verifying}
                                    style={{
                                        padding: '14px 20px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#64748b',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: verifying ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProfileSettings;
