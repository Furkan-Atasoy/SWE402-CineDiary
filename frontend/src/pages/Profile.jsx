import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';

const Profile = () => {
    const [reviews, setReviews] = useState([]);
    const [likedReviews, setLikedReviews] = useState([]);
    const [myLikedIds, setMyLikedIds] = useState([]);
    const [newReview, setNewReview] = useState({ title: '', rating: 10, comment: '', visibility: 'Public' });
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('my'); // 'my' or 'liked'
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchMyReviews();
        fetchLikedReviews();
        fetchMyLikedIds();
    }, []);

    const fetchMyReviews = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/reviews/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(res.data);
        } catch (err) {
            console.error('Fetch failed');
        }
    };

    const fetchLikedReviews = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/reviews/liked', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikedReviews(res.data);
        } catch (err) {
            console.error('Fetch liked failed');
        }
    };

    const fetchMyLikedIds = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/reviews/my-liked-ids', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyLikedIds(res.data);
        } catch (err) {
            console.error('Fetch liked IDs failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('http://localhost:5005/api/reviews', newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(res.data.message);
            if (res.data.status !== 'Blocked' && res.data.status !== 'AutoBanned') {
                setNewReview({ title: '', rating: 10, comment: '', visibility: 'Public' });
                fetchMyReviews();
            }
            if (res.data.status === 'AutoBanned') {
                setTimeout(() => { 
                    localStorage.clear();
                    window.location.href = '/login';
                }, 4000);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to post review');
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%' }}>
            <div className="hero" style={{ textAlign: 'left', minHeight: 'auto', padding: '0 0 4rem' }}>
                <h1 style={{ fontSize: '3rem' }}>Welcome back, <span className="text-gradient">{username}</span></h1>
                <p>Manage your journal, see your favorites, and keep track of your cinematic history.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>
                
                {/* New Review Form */}
                <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>New Journal Entry</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Movie/TV Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Inception"
                                value={newReview.title}
                                onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Rating (1-10)</label>
                                <input
                                    type="number"
                                    min="1" max="10"
                                    value={newReview.rating}
                                    onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Visibility</label>
                                <select
                                    value={newReview.visibility}
                                    onChange={e => setNewReview({ ...newReview, visibility: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                >
                                    <option value="Public">Public</option>
                                    <option value="Private">Private</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Review Comment</label>
                            <textarea
                                placeholder="Share your thoughts..."
                                rows="4"
                                value={newReview.comment}
                                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', resize: 'vertical' }}
                            ></textarea>
                        </div>
                        <button type="submit" className="primary" style={{ width: '100%' }}>Post Review</button>
                    </form>
                    {message && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: message.includes('posted') ? 'rgba(0,245,212,0.1)' : 'rgba(255,85,85,0.1)', color: message.includes('posted') ? 'var(--accent)' : '#ff5555', fontSize: '0.9rem', border: '1px solid currentColor' }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Tabs & List */}
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button 
                            onClick={() => setActiveTab('my')}
                            style={{ 
                                background: activeTab === 'my' ? 'var(--primary)' : 'transparent',
                                border: `1px solid ${activeTab === 'my' ? 'var(--primary)' : 'var(--glass-border)'}`,
                                color: 'white', padding: '0.8rem 1.5rem', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' 
                            }}
                        >My Dictionary</button>
                        <button 
                            onClick={() => setActiveTab('liked')}
                            style={{ 
                                background: activeTab === 'liked' ? 'var(--primary)' : 'transparent',
                                border: `1px solid ${activeTab === 'liked' ? 'var(--primary)' : 'var(--glass-border)'}`,
                                color: 'white', padding: '0.8rem 1.5rem', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' 
                            }}
                        >❤️ Liked Reviews</button>
                    </div>

                    <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {activeTab === 'my' ? (
                            reviews.length > 0 ? reviews.map(r => <ReviewCard key={r.ReviewID} review={r} isLikedInitial={myLikedIds.includes(r.ReviewID)} />) 
                            : <p style={{ color: 'var(--text-muted)' }}>You haven't written any reviews yet.</p>
                        ) : (
                            likedReviews.length > 0 ? likedReviews.map(r => <ReviewCard key={r.ReviewID} review={r} isLikedInitial={true} />)
                            : <p style={{ color: 'var(--text-muted)' }}>You haven't liked any reviews yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
