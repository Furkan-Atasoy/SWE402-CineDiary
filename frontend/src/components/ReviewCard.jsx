import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewCard = ({ review, onAdminDelete, isLikedInitial = false }) => {
    const [likes, setLikes] = useState(review.LikeCount || 0);
    const [isLiked, setIsLiked] = useState(isLikedInitial);
    const [isUpdating, setIsUpdating] = useState(false);
    const token = localStorage.getItem('token');

    // Sync with global like state if provided (though usually handled by parent)
    useEffect(() => {
        setIsLiked(isLikedInitial);
    }, [isLikedInitial]);

    const handleLike = async () => {
        if (!token) {
            alert('Please sign in to like reviews');
            return;
        }
        if (isUpdating) return;

        setIsUpdating(true);
        try {
            const res = await axios.post(`http://localhost:5005/api/reviews/${review.ReviewID}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsLiked(res.data.liked);
            setLikes(prev => res.data.liked ? prev + 1 : prev - 1);
        } catch (err) {
            console.error('Like failed');
        } finally {
            setIsUpdating(false);
        }
    };

    const ratingColor = (r) => {
        if (r >= 8) return 'var(--accent)';
        if (r >= 5) return '#f5c518';
        return '#ff5555';
    };

    return (
        <div className="card review-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{review.TitleNormalized}</h3>
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '12px',
                    border: `1px solid ${ratingColor(review.Rating)}44`,
                    color: ratingColor(review.Rating),
                    fontWeight: '800',
                    fontSize: '0.9rem'
                }}>
                    ⭐ {review.Rating}/10
                </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "{review.Comment}"
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {review.Username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{review.Username}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(review.CreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Like Button */}
                    <button 
                        onClick={handleLike}
                        disabled={isUpdating}
                        style={{
                            background: isLiked ? 'rgba(0, 245, 212, 0.1)' : 'transparent',
                            border: `1px solid ${isLiked ? 'var(--accent)' : 'var(--glass-border)'}`,
                            color: isLiked ? 'var(--accent)' : 'var(--text-muted)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isLiked ? '❤️' : '🤍'} {likes}
                    </button>

                    {onAdminDelete && (
                        <button
                            onClick={() => onAdminDelete(review.ReviewID)}
                            style={{ background: 'transparent', border: '1px solid #ff5555', color: '#ff5555', padding: '0.4rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
