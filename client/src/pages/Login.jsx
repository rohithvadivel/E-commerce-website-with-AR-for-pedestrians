import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isAuthenticated, role, requiresPasswordChange } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect to change password if required
            if (requiresPasswordChange) {
                navigate('/change-password');
            } else if (role === 'seller') navigate('/seller');
            else if (role === 'admin') navigate('/admin');
            else navigate('/buyer');
        }
    }, [isAuthenticated, role, requiresPasswordChange, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="auth-page">
            {/* Left Side - Image */}
            <div className="auth-hero">
                <div className="auth-hero-overlay" />
                <div className="auth-hero-gradient" />
                <img
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Art Background"
                    className="auth-hero-image"
                />
                <div className="auth-hero-content">
                    <h1 className="auth-hero-title">
                        Discover <span className="auth-hero-highlight">Extraordinary</span> Art.
                    </h1>
                    <p className="auth-hero-subtitle">Join the world's most premium digital marketplace.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
                <div className="auth-form-card">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Welcome Back</h2>
                        <p className="auth-form-subtitle">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form space-y-6">
                        <div className="space-y-4">
                            <div className="auth-input-group">
                                <div className="auth-input-icon">
                                    <Mail />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <Link to="/forgot-password" className="text-sm font-medium text-amber-500 hover:text-amber-400">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn">
                            Sign in
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    <p className="auth-footer mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
