import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const Home = () => {
    const [reviews, setReviews] = useState([]);
    const [myLikedIds, setMyLikedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [minRating, setMinRating] = useState(null);
    const [maxRating, setMaxRating] = useState(null);
    const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'likes'
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPublicReviews(minRating, maxRating, sortBy);
        if (token) fetchMyLikedIds();
    }, [minRating, maxRating, sortBy, token]);

    const fetchPublicReviews = async (min, max, sort) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (min) params.append('minRating', min);
            if (max) params.append('maxRating', max);
            if (sort === 'likes') params.append('sortBy', 'likes');
            const res = await axios.get(`http://localhost:5005/api/reviews/public?${params.toString()}`);
            setReviews(res.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyLikedIds = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/reviews/my-liked-ids', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyLikedIds(res.data);
        } catch (err) {
            console.error('Error fetching likes');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchResults(null);
        try {
            const res = await axios.get(`http://localhost:5005/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data);
        } catch (err) {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleAdminDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await axios.delete(`http://localhost:5005/api/admin/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(reviews.filter(r => r.ReviewID !== reviewId));
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleStarClick = (star) => {
        if (minRating === star && maxRating === star) {
            setMinRating(null); setMaxRating(null);
        } else {
            setMinRating(star); setMaxRating(star);
        }
    };

    const handleRangeFilter = (min, max) => {
        if (minRating === min && maxRating === max) {
            setMinRating(null); setMaxRating(null);
        } else {
            setMinRating(min); setMaxRating(max);
        }
    };

    const starColor = (star) => {
        if (star <= 3) return '#ff5555';
        if (star <= 5) return '#ff9944';
        if (star <= 7) return '#f5c518';
        return '#00f5d4';
    };

    const activeFilter = minRating !== null;

    return (
        <div>
            {/* Hero */}
            <div className="hero">
                <h1>The Future of <span className="text-gradient">Movie Journaling</span></h1>
                <p>Track your cinematic journey, discover curated reviews, and build your own private TV archive.</p>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', maxWidth: '500px', margin: '3rem auto 0' }}>
                    <input
                        type="text"
                        placeholder="Search users by username..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="primary" style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        Search
                    </button>
                </form>

                {searching && <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Searching...</p>}
                {searchResults !== null && (
                    <div style={{ marginTop: '2rem', maxWidth: '500px', margin: '2rem auto 0', textAlign: 'left' }}>
                        {searchResults.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found for "{searchQuery}"</div>
                        ) : (
                            searchResults.map(user => (
                                <a key={user.UserID} href={`/user/${user.UserID}`} style={{ textDecoration: 'none' }}>
                                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', cursor: 'pointer' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0, color: 'white' }}>
                                            {user.Username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{user.Username}</h3>
                                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.ReviewCount} public reviews</p>
                                        </div>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5% 4rem' }}>
                {/* Filters */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Sort Bar */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>SORT BY:</span>
                        <button 
                            onClick={() => setSortBy('latest')}
                            className={sortBy === 'latest' ? 'primary' : ''}
                            style={{ padding: '0.5rem 1.2rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: sortBy === 'latest' ? 'var(--primary)' : 'transparent', color: 'white' }}
                        >Latest</button>
                        <button 
                            onClick={() => setSortBy('likes')}
                            className={sortBy === 'likes' ? 'primary' : ''}
                            style={{ padding: '0.5rem 1.2rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: sortBy === 'likes' ? 'var(--primary)' : 'transparent', color: 'white' }}
                        >🔥 Most Liked</button>
                    </div>

                    {/* Rating filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>FILTER BY:</span>
                        {[
                            { label: '😞 1–3', min: 1, max: 3 },
                            { label: '😐 4–6', min: 4, max: 6 },
                            { label: '😊 7–8', min: 7, max: 8 },
                            { label: '🤩 9–10', min: 9, max: 10 },
                        ].map(range => (
                            <button
                                key={range.label}
                                onClick={() => handleRangeFilter(range.min, range.max)}
                                style={{
                                    background: (minRating === range.min && maxRating === range.max) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem'
                                }}
                            >{range.label}</button>
                        ))}
                        {activeFilter && (
                            <button onClick={() => { setMinRating(null); setMaxRating(null); }} style={{ background: 'transparent', border: '1px solid #ff5555', color: '#ff5555', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer' }}>✕ Clear</button>
                        )}
                    </div>
                </div>

                <h2 style={{ marginBottom: '2rem' }}>Community Feed</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <div className="card-grid">
                        {reviews.length > 0 ? (
                            reviews.map(review => (
                                <ReviewCard 
                                    key={review.ReviewID} 
                                    review={review} 
                                    isLikedInitial={myLikedIds.includes(review.ReviewID)}
                                    onAdminDelete={role === 'Admin' ? handleAdminDelete : null} 
                                />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                                <h2 style={{ color: 'var(--text-muted)' }}>No reviews match this filter</h2>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
