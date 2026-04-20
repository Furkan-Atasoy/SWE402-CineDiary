import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';

const UserProfile = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5005/api/users/${userId}`);
                setUserData(res.data.user);
                setReviews(res.data.reviews);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [userId]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '8rem' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!userData) {
        return <div style={{ textAlign: 'center', padding: '8rem' }}><h2>User not found.</h2></div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 5%' }}>
            {/* User Header */}
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '4rem' }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', fontSize: '2.5rem', color: 'var(--bg)', flexShrink: 0
                }}>
                    {userData.Username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{userData.Username}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Member since {new Date(userData.CreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent)' }}>{reviews.length}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Public Reviews</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent)' }}>
                                {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.Rating, 0) / reviews.length).toFixed(1) : '—'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>
                <span className="text-gradient">{userData.Username}</span>'s Reviews
            </h2>
            {reviews.length > 0 ? (
                <div className="card-grid">
                    {reviews.map(review => (
                        <ReviewCard key={review.ReviewID} review={review} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '32px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>This user has no public reviews yet.</p>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
