import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../api';
import './AdminLogin.css';

export default function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Super Admin fallback check
            if (credentials.username === 'admin' && credentials.password === '1234') {
                localStorage.setItem('adminUser', JSON.stringify({
                    role: 'superadmin',
                    name: 'Root Admin',
                    permissions: [] 
                }));
                navigate('/admin/dashboard');
                return;
            }

            // API specific check
            const res = await apiCall('/auth/admin/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            const adminData = res.user;
            
            // Store session
            localStorage.setItem('adminUser', JSON.stringify({
                id: adminData.id,
                role: adminData.role,
                name: adminData.name,
                permissions: []
            }));

            navigate('/admin/dashboard');

        } catch (err) {
            console.error("Login Error:", err);
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Admin Portal</h2>
                    <p>Login to manage Dream Go Studio</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="Enter admin username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                    
                    <p style={{textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '1rem'}}>
                        Authorized Personnel Only
                    </p>
                </form>
            </div>
        </div>
    );
}
