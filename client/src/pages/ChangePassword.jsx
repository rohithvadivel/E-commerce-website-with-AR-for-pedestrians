import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, XCircle, Loader, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { isAuthenticated, role, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Password validation checks
    const passwordChecks = {
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
    };

    const allChecksPassed = Object.values(passwordChecks).every(Boolean);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!allChecksPassed) {
            setError('Please meet all password requirements');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${API_BASE_URL}/api/auth/change-password`,
                { currentPassword, newPassword },
                { headers: { 'x-auth-token': token } }
            );
            setSuccess('Password changed successfully! Redirecting...');
            setTimeout(() => {
                // Redirect to appropriate dashboard
                if (role === 'seller') navigate('/seller');
                else if (role === 'admin') navigate('/admin');
                else navigate('/buyer');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const CheckItem = ({ passed, text }) => (
        <div className={`password-check-item ${passed ? 'passed' : ''}`}>
            {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="auth-page">
            {/* Left Side - Image */}
            <div className="auth-hero">
                <div className="auth-hero-overlay" />
                <div className="auth-hero-gradient" />
                <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2664&auto=format&fit=crop"
                    alt="Art Background"
                    className="auth-hero-image"
                />
                <div className="auth-hero-content">
                    <h1 className="auth-hero-title">
                        Secure Your <span className="auth-hero-highlight">Account</span>.
                    </h1>
                    <p className="auth-hero-subtitle">Update your password to meet security requirements.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
                <div className="auth-form-card">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Change Password</h2>
                        <p className="auth-form-subtitle">
                            Your password needs to be updated to meet our security requirements.
                        </p>
                    </div>

                    {error && <div className="signup-error">{error}</div>}
                    {success && <div className="signup-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-input-group">
                            <div className="auth-input-icon">
                                <Lock />
                            </div>
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                required
                                className="input-field"
                                placeholder="Current Password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="auth-input-group">
                            <div className="auth-input-icon">
                                <Lock />
                            </div>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                required
                                className="input-field"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Requirements Checklist */}
                        <div className="password-requirements">
                            <p className="password-requirements-title">Password must contain:</p>
                            <div className="password-checks-grid">
                                <CheckItem passed={passwordChecks.minLength} text="At least 8 characters" />
                                <CheckItem passed={passwordChecks.hasUppercase} text="One uppercase letter" />
                                <CheckItem passed={passwordChecks.hasLowercase} text="One lowercase letter" />
                                <CheckItem passed={passwordChecks.hasNumber} text="One number" />
                                <CheckItem passed={passwordChecks.hasSpecial} text="One special character" />
                            </div>
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
                            />
                            {confirmPassword && (
                                <div className={`confirm-password-icon ${passwordsMatch ? 'match' : 'no-match'}`}>
                                    {passwordsMatch ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading || !allChecksPassed || !passwordsMatch}
                        >
                            {loading ? <Loader className="spin" size={16} /> : 'Update Password'}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
