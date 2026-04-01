import { useState, useContext } from 'react';
import { apiCall } from '../../api';
import { AuthContext } from '../../context/AuthContext';
import './ClientAuth.css';

export default function ClientAuth({ onAuthSuccess, onCancel }) {
    const [isLoginView, setIsLoginView] = useState(true); // Toggle between Login and Create Account

    // Form states
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [username, setUsername] = useState('');

    // UI states
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Context
    const { login } = useContext(AuthContext);

    // After signup, we show the generated username to the user
    // They must click "Continue" to actually log in.
    const [generatedUsername, setGeneratedUsername] = useState('');

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setGeneratedUsername('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Basic validation
            if (!name || !mobile) {
                throw new Error("All fields are required.");
            }

            // Generate unique username
            const firstName = name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const newUsername = `${firstName}_${randomNum}`;

            // API Register
            await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    mobile,
                    username: newUsername,
                    password: mobile // using mobile as password
                })
            });

            // 4. Show success screen with username
            setGeneratedUsername(newUsername);

            // Note: We don't automatically log them in here. 
            // We force them to see their username first.

        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let searchUser = username;
            let searchPass = mobile;

            // If auto-logging in after signup
            if (generatedUsername) {
                searchUser = generatedUsername;
                searchPass = mobile; // mobile is still in state from signup form
            }

            if (!searchUser || !searchPass) {
                throw new Error("Username and Mobile number are required to login.");
            }

            // Search API for matching username & password(mobile)
            const res = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: searchUser,
                    password: searchPass
                })
            });

            if (!res.success) {
                throw new Error(res.message || "Invalid Username or Mobile Number.");
            }

            // Login successful
            const userData = res.user;

            // Save to context/localStorage
            login({
                id: userData.id,
                name: userData.name,
                mobile: userData.mobile,
                username: userData.username
            });

            // Callback to close modal/change view
            if (onAuthSuccess) onAuthSuccess();

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };


    // If user just signed up, show them their generated username
    if (generatedUsername) {
        return (
            <div className="client-auth-container generated-view">
                <div className="auth-header text-center">
                    <h2>Registration Successful! 🎉</h2>
                    <p>Welcome to Dream Go Studio, {name}.</p>
                </div>

                <div className="generated-username-box">
                    <p>Your unique login Username is:</p>
                    <h3>{generatedUsername}</h3>
                    <p className="notice">Please save this! You will need it alongside your mobile number to log in next time.</p>
                </div>

                <button
                    className="auth-btn submit-btn"
                    onClick={() => handleLogin()}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Log In & Continue'}
                </button>
            </div>
        );
    }

    return (
        <div className="client-auth-container">
            {onCancel && (
                <button className="back-btn" onClick={onCancel}>← Back</button>
            )}

            <div className="auth-header">
                <h2>{isLoginView ? 'Welcome Back!' : 'Create an Account'}</h2>
                <p>
                    {isLoginView
                        ? 'Login with your Username and Mobile Number.'
                        : 'Register to book your dream photography session.'}
                </p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            {isLoginView ? (
                /* LOGIN FORM */
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. Kamal_4582"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password (Mobile Number)</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="e.g. 0771234567"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn submit-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                    <p className="auth-footer">
                        Don't have an account? <span onClick={toggleView}>Create Account here</span>
                    </p>
                </form>
            ) : (
                /* CREATE ACCOUNT FORM */
                <form onSubmit={handleSignup} className="auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Mobile Number (Used as Password)</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="e.g. 0771234567"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                    <p className="auth-footer">
                        Already have an account? <span onClick={toggleView}>Log In here</span>
                    </p>
                </form>
            )}
        </div>
    );
}
