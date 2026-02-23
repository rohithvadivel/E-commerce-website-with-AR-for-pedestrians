import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg);
            setSuccess(data.msg);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-forgot-password-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg);
            setSuccess('');
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || (data.errors && data.errors[0]) || 'Failed to reset password');
            setSuccess(data.msg);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left Side - Image */}
            <div className="auth-hero">
                <div className="auth-hero-overlay" />
                <div className="auth-hero-gradient" />
                <img
                    src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Art Background"
                    className="auth-hero-image"
                />
                <div className="auth-hero-content">
                    <h1 className="auth-hero-title">
                        Secure your <span className="auth-hero-highlight">Account</span>.
                    </h1>
                    <p className="auth-hero-subtitle">Recover access to your premium digital marketplace.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
                <div className="auth-form-card relative">
                    {/* Back Button */}
                    <Link to="/login" className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to login
                    </Link>

                    <div className="auth-form-header mt-8">
                        <h2 className="auth-form-title">Forgot Password</h2>
                        <p className="auth-form-subtitle">
                            {step === 1 && "Enter your email address to receive a reset code."}
                            {step === 2 && "Enter the 6-digit code sent to your email."}
                            {step === 3 && "Create a new secure password."}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendEmail} className="auth-form space-y-6">
                            <div className="auth-input-group">
                                <div className="auth-input-icon">
                                    <Mail />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="auth-submit-btn">
                                {loading ? 'Sending...' : 'Send Reset Code'}
                                <ArrowRight size={16} />
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="auth-form space-y-6">
                            <div className="auth-input-group">
                                <div className="auth-input-icon">
                                    <KeyRound />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input-field tracking-[0.5em] font-mono text-center"
                                    placeholder="000000"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <button type="submit" disabled={loading} className="auth-submit-btn">
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setOtp(''); setSuccess(''); setError(''); }}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Change Email or Resend Code
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="auth-form space-y-6">
                            <div className="space-y-4">
                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <Lock />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="auth-input-group">
                                    <div className="auth-input-icon">
                                        <Lock />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="auth-submit-btn">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
