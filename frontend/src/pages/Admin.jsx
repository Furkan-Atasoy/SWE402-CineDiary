import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
    const [blockedReviews, setBlockedReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' or 'users'
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (activeTab === 'moderation') fetchBlocked();
        else fetchUsers();
    }, [activeTab]);

    const fetchBlocked = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5005/api/admin/blocked', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlockedReviews(res.data);
        } catch (err) {
            console.error('Fetch blocked failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (q = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5005/api/admin/users?q=${q}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Fetch users failed');
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (logId, reviewId, action) => {
        try {
            await axios.post('http://localhost:5005/api/admin/moderate', { logId, reviewId, action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlockedReviews(blockedReviews.filter(r => r.LogID !== logId));
        } catch (err) {
            alert('Moderation failed');
        }
    };

    const handleBan = async (userId, banType) => {
        if (!window.confirm(`Are you sure you want to perform action: ${banType}?`)) return;
        try {
            await axios.post('http://localhost:5005/api/admin/ban', { userId, banType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers(userSearch);
        } catch (err) {
            alert('Ban action failed');
        }
    };

    const handleUserSearch = (e) => {
        e.preventDefault();
        fetchUsers(userSearch);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%' }}>
            {/* Custom Modal */}
            {selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(240, 242, 255, 0.9)', backdropFilter: 'blur(20px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="glass-panel" style={{ 
                        maxWidth: '600px', width: '100%', padding: '3rem', position: 'relative',
                        border: '1px solid var(--accent)'
                    }}>
                        <button 
                            onClick={() => setSelectedUser(null)}
                            style={{ 
                                position: 'absolute', top: '1.5rem', right: '1.5rem', 
                                background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' 
                            }}
                        >&times;</button>
                        
                        <h2 style={{ marginBottom: '0.5rem' }}>Violation <span className="text-gradient">History</span></h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                Registry logs for citizen <strong style={{ color: 'var(--text-main)' }}>@{selectedUser.Username}</strong>.
                            </p>
                            {selectedUser.BannedUntil && new Date(selectedUser.BannedUntil) > new Date() && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#ff5555', textTransform: 'uppercase', fontWeight: 'bold' }}>Current Ban Expires</div>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{new Date(selectedUser.BannedUntil).toLocaleString()}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
                            {selectedUser.FlaggedComments.split(' | ').map((entry, index) => {
                                const dateMatch = entry.match(/^\[(.*?)\]\s(.*)$/);
                                const dateStr = dateMatch ? dateMatch[1] : 'Unknown Date';
                                const commentText = dateMatch ? dateMatch[2] : entry;
                                
                                return (
                                    <div key={index} style={{ 
                                        background: 'rgba(0,0,0,0.03)', padding: '1.2rem', 
                                        borderRadius: '12px', borderLeft: '4px solid #ff5555' 
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#ff5555', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                Violation #{index + 1}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {dateStr}
                                            </div>
                                        </div>
                                        <div style={{ color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.5' }}>
                                            "{commentText}"
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        <button 
                            className="primary" 
                            style={{ marginTop: '2.5rem', width: '100%' }}
                            onClick={() => setSelectedUser(null)}
                        >
                            Close Registry Entry
                        </button>
                    </div>
                </div>
            )}

            <div className="hero" style={{ textAlign: 'left', minHeight: 'auto', padding: '0 0 4rem' }}>
                <h1 style={{ fontSize: '3rem' }}>Control <span className="text-gradient">Registry</span></h1>
                <p>Monitor community health, moderate violations, and manage user access.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <button 
                    onClick={() => setActiveTab('moderation')}
                    style={{ 
                        background: activeTab === 'moderation' ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--glass-border)', color: activeTab === 'moderation' ? 'white' : 'var(--text-main)', padding: '1rem 2rem', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                >Moderation Queue ({blockedReviews.length})</button>
                <button 
                    onClick={() => setActiveTab('users')}
                    style={{ 
                        background: activeTab === 'users' ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                        border: '1px solid var(--glass-border)', color: activeTab === 'users' ? 'white' : 'var(--text-main)', padding: '1rem 2rem', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                >User Management</button>
            </div>

            {loading && <p>Loading registry data...</p>}

            {activeTab === 'moderation' ? (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '2rem' }}>Pending Violations</h2>
                    {blockedReviews.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem' }}>Registry is clean. No pending violations.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Movie</th>
                                    <th style={{ padding: '1rem' }}>Flagged Content</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockedReviews.map(r => (
                                    <tr key={r.LogID} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{r.Username}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#ff5555' }}>Violations: {r.ViolationCount}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{r.TitleNormalized}</td>
                                        <td style={{ padding: '1rem', color: '#ff5555', fontStyle: 'italic', maxWidth: '300px' }}>"{r.OriginalComment}"</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleModerate(r.LogID, r.ReviewID, 'Approved')} style={{ background: '#00f5d4', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                                                <button onClick={() => handleModerate(r.LogID, r.ReviewID, 'Deleted')} style={{ background: '#ff5555', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ margin: 0 }}>Global Citizen Directory</h2>
                        <form onSubmit={handleUserSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="text" 
                                placeholder="Search by username or email..." 
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                style={{ width: '300px' }}
                            />
                            <button type="submit" className="primary">Search</button>
                        </form>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Citizen</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>History</th>
                                <th style={{ padding: '1rem' }}>Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const isBanned = u.IsBanned || (u.BannedUntil && new Date(u.BannedUntil) > new Date());
                                return (
                                    <tr key={u.UserID} style={{ borderBottom: '1px solid var(--glass-border)', opacity: u.Role === 'Admin' ? 0.6 : 1 }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold', color: u.Role === 'Admin' ? 'var(--accent)' : 'var(--text-main)' }}>{u.Username} {u.Role === 'Admin' && '🛡️'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.Email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {isBanned ? (
                                                <span style={{ color: '#ff5555', background: 'rgba(255,85,85,0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {u.IsBanned ? 'PERMANENT BAN' : `SUSPENDED (Until ${new Date(u.BannedUntil).toLocaleDateString()})`}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#00f5d4', background: 'rgba(0,245,212,0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>ACTIVE</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>Reviews: {u.ReviewCount}</div>
                                            <div style={{ fontSize: '0.85rem', color: u.ViolationCount > 0 ? '#ff5555' : 'var(--text-muted)' }}>
                                                Violations: {u.ViolationCount}
                                            </div>
                                            {u.FlaggedComments && (
                                                <button 
                                                    onClick={() => setSelectedUser(u)}
                                                    style={{ 
                                                        background: 'none', border: 'none', color: 'var(--accent)', 
                                                        fontSize: '0.75rem', padding: '0.5rem 0', cursor: 'pointer', 
                                                        textDecoration: 'underline', display: 'block' 
                                                    }}
                                                >
                                                    View Flagged History
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {u.Role === 'User' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {isBanned ? (
                                                        <button onClick={() => handleBan(u.UserID, 'unban')} style={{ background: '#00f5d4', color: '#000', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Unban Citizen</button>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleBan(u.UserID, '24h')} style={{ background: 'rgba(255,153,68,0.1)', color: '#ff9944', border: '1px solid #ff9944', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>24h Ban</button>
                                                            <button onClick={() => handleBan(u.UserID, '7d')} style={{ background: 'rgba(255,153,68,0.1)', color: '#ff9944', border: '1px solid #ff9944', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>7d Ban</button>
                                                            <button onClick={() => handleBan(u.UserID, 'permanent')} style={{ background: 'rgba(255,85,85,0.1)', color: '#ff5555', border: '1px solid #ff5555', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Perm Ban</button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin;
