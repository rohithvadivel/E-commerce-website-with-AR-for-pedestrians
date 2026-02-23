import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Briefcase, Phone, MapPin, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer',
        phone: '',
        otp: '',
        emailOtp: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [emailResendTimer, setEmailResendTimer] = useState(0);

    const { register, isAuthenticated, role } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            if (role === 'seller') navigate('/seller');
            else if (role === 'admin') navigate('/admin');
            else navigate('/buyer');
        }
    }, [isAuthenticated, role, navigate]);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Email resend timer
    useEffect(() => {
        let interval;
        if (emailResendTimer > 0) {
            interval = setInterval(() => {
                setEmailResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [emailResendTimer]);

    const { name, email, password, role: userRole, phone, otp, emailOtp, addressLine1, addressLine2, city, state, pincode } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // Password validation checks
    const passwordChecks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

    const validateStep1 = () => {
        if (!name || !email || !password) {
            setError('Please fill all required fields');
            return false;
        }
        if (!allPasswordChecksPassed) {
            setError('Password does not meet all requirements');
            return false;
        }
        if (!emailVerified) {
            setError('Please verify your email first');
            return false;
        }
        return true;
    };

    // Send email OTP
    const handleSendEmailOTP = async () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_BASE_URL}/api/auth/register/send-email-otp`, { email });
            setEmailOtpSent(true);
            setEmailResendTimer(60);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    // Verify email OTP
    const handleVerifyEmailOTP = async () => {
        if (!emailOtp || emailOtp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register/verify-email-otp`, { email, otp: emailOtp });
            if (res.data.verified) {
                setEmailVerified(true);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const validateStep2 = () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const validateStep4 = () => {
        if (!addressLine1 || !city || !state || !pincode) {
            setError('Please fill all required address fields');
            return false;
        }
        if (pincode.length !== 6) {
            setError('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handleSendOTP = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_BASE_URL}/api/auth/register/send-otp`, { phone, role: userRole });
            setOtpSent(true);
            setResendTimer(60);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register/verify-otp`, { phone, otp });
            if (res.data.verified) {
                setPhoneVerified(true);
                setStep(4);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep4()) return;

        setLoading(true);
        setError('');

        const userData = {
            name,
            email,
            password,
            role: userRole,
            phone,
            address: {
                addressLine1,
                addressLine2,
                city,
                state,
                pincode
            }
        };

        try {
            await register(userData);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
            setError('');
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
            setError('');
        }
    };

    const renderProgressBar = () => (
        <div className="signup-progress">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className="signup-progress-step">
                    <div className={`signup-progress-circle ${step >= s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                        {step > s ? <CheckCircle size={16} /> : s}
                    </div>
                    {s < 4 && <div className={`signup-progress-line ${step > s ? 'completed' : ''}`} />}
                </div>
            ))}
        </div>
    );

    const renderStepLabels = () => (
        <div className="signup-step-labels">
            <span className={step === 1 ? 'active' : ''}>Account</span>
            <span className={step === 2 ? 'active' : ''}>Phone</span>
            <span className={step === 3 ? 'active' : ''}>Verify</span>
            <span className={step === 4 ? 'active' : ''}>Address</span>
        </div>
    );

    return (
        <div className="auth-page">
            {/* Left Side - Image */}
            <div className="auth-hero">
                <div className="auth-hero-overlay" />
                <div className="auth-hero-gradient" />
                <img
                    src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2670&auto=format&fit=crop"
                    alt="Art Background"
                    className="auth-hero-image"
                />
                <div className="auth-hero-content">
                    <h1 className="auth-hero-title">
                        Create Your <span className="auth-hero-highlight">Palette</span>.
                    </h1>
                    <p className="auth-hero-subtitle">Start your journey as a collector or creator today.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
                <div className="auth-form-card signup-card">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Get Started</h2>
                        <p className="auth-form-subtitle">Create your account to join Artistry.</p>
                    </div>

                    {renderProgressBar()}
                    {renderStepLabels()}

                    {error && <div className="signup-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="signup-step">
                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <User />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="input-field"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={onChange}
                                    />
                                </div>

                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <Mail />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="input-field"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={onChange}
                                        disabled={emailVerified}
                                    />
                                    {emailVerified && (
                                        <div className="confirm-password-icon match">
                                            <CheckCircle size={20} />
                                        </div>
                                    )}
                                </div>

                                {/* Email Verification Section */}
                                {!emailVerified && email && email.includes('@') && (
                                    <div className="email-verification-section">
                                        {!emailOtpSent ? (
                                            <button
                                                type="button"
                                                onClick={handleSendEmailOTP}
                                                disabled={loading || emailResendTimer > 0}
                                                className="auth-otp-btn"
                                            >
                                                {loading ? (
                                                    <><Loader size={16} className="spin" /> Sending...</>
                                                ) : emailResendTimer > 0 ? (
                                                    `Resend in ${emailResendTimer}s`
                                                ) : (
                                                    'Verify Email'
                                                )}
                                            </button>
                                        ) : (
                                            <div className="email-otp-input-group">
                                                <input
                                                    type="text"
                                                    name="emailOtp"
                                                    className="input-field otp-input"
                                                    placeholder="Enter 6-digit code"
                                                    value={emailOtp}
                                                    onChange={onChange}
                                                    maxLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyEmailOTP}
                                                    disabled={loading || emailOtp.length !== 6}
                                                    className="auth-verify-btn"
                                                >
                                                    {loading ? <Loader size={16} className="spin" /> : 'Verify'}
                                                </button>
                                            </div>
                                        )}
                                        {emailOtpSent && emailResendTimer > 0 && (
                                            <p className="otp-sent-message">
                                                Code sent! Check your email. Resend in {emailResendTimer}s
                                            </p>
                                        )}
                                        {emailOtpSent && emailResendTimer === 0 && (
                                            <button
                                                type="button"
                                                onClick={handleSendEmailOTP}
                                                disabled={loading}
                                                className="resend-link"
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </div>
                                )}

                                {emailVerified && (
                                    <div className="signup-success">
                                        ✓ Email verified successfully!
                                    </div>
                                )}

                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <Lock />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="input-field"
                                        placeholder="Password"
                                        value={password}
                                        onChange={onChange}
                                    />
                                </div>

                                {/* Password Requirements Checklist */}
                                {password && (
                                    <div className="password-requirements">
                                        <p className="password-requirements-title">Password must contain:</p>
                                        <div className="password-checks-grid">
                                            <div className={`password-check-item ${passwordChecks.minLength ? 'passed' : ''}`}>
                                                {passwordChecks.minLength ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                <span>At least 8 characters</span>
                                            </div>
                                            <div className={`password-check-item ${passwordChecks.hasUppercase ? 'passed' : ''}`}>
                                                {passwordChecks.hasUppercase ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                <span>One uppercase letter</span>
                                            </div>
                                            <div className={`password-check-item ${passwordChecks.hasLowercase ? 'passed' : ''}`}>
                                                {passwordChecks.hasLowercase ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                <span>One lowercase letter</span>
                                            </div>
                                            <div className={`password-check-item ${passwordChecks.hasNumber ? 'passed' : ''}`}>
                                                {passwordChecks.hasNumber ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                <span>One number</span>
                                            </div>
                                            <div className={`password-check-item ${passwordChecks.hasSpecial ? 'passed' : ''}`}>
                                                {passwordChecks.hasSpecial ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                <span>One special character</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <Briefcase />
                                    </div>
                                    <select
                                        name="role"
                                        value={userRole}
                                        onChange={onChange}
                                        className="input-field pl-10 appearance-none"
                                    >
                                        <option value="buyer">I want to Buy Art</option>
                                        <option value="seller">I want to Sell Art</option>
                                        {/* <option value="admin">I am an Admin</option> */}
                                    </select>
                                </div>

                                <button type="button" onClick={nextStep} className="auth-submit-btn">
                                    Continue
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* Step 2: Phone Number */}
                        {step === 2 && (
                            <div className="signup-step">
                                <div className="signup-step-info">
                                    <Phone size={48} className="signup-step-icon" />
                                    <h3>Verify Your Phone</h3>
                                    <p>We'll send a 6-digit OTP to verify your number</p>
                                </div>

                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <Phone />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="input-field"
                                        placeholder="Phone number (10 digits)"
                                        value={phone}
                                        onChange={onChange}
                                        maxLength={10}
                                    />
                                </div>

                                <div className="signup-btn-group">
                                    <button type="button" onClick={prevStep} className="auth-back-btn">
                                        <ArrowLeft size={16} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="auth-submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader className="spin" size={16} /> : 'Send OTP'}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: OTP Verification */}
                        {step === 3 && (
                            <div className="signup-step">
                                <div className="signup-step-info">
                                    <CheckCircle size={48} className="signup-step-icon" />
                                    <h3>Enter OTP</h3>
                                    <p>Enter the 6-digit code sent to +91{phone}</p>
                                </div>

                                <div className="auth-input-group otp-input-group">
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        className="input-field otp-input"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={onChange}
                                        maxLength={6}
                                    />
                                </div>

                                <div className="resend-otp">
                                    {resendTimer > 0 ? (
                                        <span>Resend OTP in {resendTimer}s</span>
                                    ) : (
                                        <button type="button" onClick={handleSendOTP} className="resend-btn">
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                <div className="signup-btn-group">
                                    <button type="button" onClick={prevStep} className="auth-back-btn">
                                        <ArrowLeft size={16} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        className="auth-submit-btn verify-btn"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader className="spin" size={16} /> : 'Verify OTP'}
                                        <CheckCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Address */}
                        {step === 4 && (
                            <div className="signup-step">
                                <div className="signup-step-info compact">
                                    <MapPin size={32} className="signup-step-icon" />
                                    <h3>Your Address</h3>
                                </div>

                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <MapPin />
                                    </div>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        required
                                        className="input-field"
                                        placeholder="Address Line 1 *"
                                        value={addressLine1}
                                        onChange={onChange}
                                    />
                                </div>

                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <MapPin />
                                    </div>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        className="input-field"
                                        placeholder="Address Line 2 (optional)"
                                        value={addressLine2}
                                        onChange={onChange}
                                    />
                                </div>

                                <div className="auth-input-row">
                                    <div className="auth-input-group">
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            className="input-field"
                                            placeholder="City *"
                                            value={city}
                                            onChange={onChange}
                                        />
                                    </div>
                                    <div className="auth-input-group">
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            className="input-field"
                                            placeholder="State *"
                                            value={state}
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <input
                                        type="text"
                                        name="pincode"
                                        required
                                        className="input-field"
                                        placeholder="Pincode (6 digits) *"
                                        value={pincode}
                                        onChange={onChange}
                                        maxLength={6}
                                    />
                                </div>

                                <div className="signup-btn-group">
                                    <button type="button" onClick={prevStep} className="auth-back-btn">
                                        <ArrowLeft size={16} />
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="auth-submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader className="spin" size={16} /> : 'Create Account'}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p className="auth-footer mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
