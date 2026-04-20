import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5005/api/auth/login', { ...formData, isAdminRoute: true });
            if (res.data.role !== 'Admin') {
                setError('Access denied. This login is for administrators only.');
                setLoading(false);
                return;
            }
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>

                {/* Shield icon header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #8a2be2, #4b0082)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', margin: '0 auto 1.2rem',
                        boxShadow: '0 0 30px rgba(138,43,226,0.5)'
                    }}>🛡️</div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 0.5rem' }}>Admin Portal</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Restricted access — authorised personnel only
                    </p>
                </div>

                <div className="glass-panel">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                placeholder="admin@cinediary.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.3)',
                                borderRadius: '12px', padding: '0.8rem 1rem',
                                color: '#ff5555', fontSize: '0.9rem', marginBottom: '1.5rem'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary"
                            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : '🔐 Enter Admin Panel'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <a href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Regular user? Sign in here →
                        </a>
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2rem' }}>
                    All access attempts are logged and monitored.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
