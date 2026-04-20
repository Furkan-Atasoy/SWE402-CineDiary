import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Trending = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await axios.get('http://localhost:5005/api/trending');
                setMovies(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div>
            <div className="hero">
                <h1>🔥 What's <span className="text-gradient">Trending</span></h1>
                <p>The most reviewed and talked-about movies and TV shows in the community right now.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚡ Results served from Redis cache — refreshes every hour.</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5% 4rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : movies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '32px' }}>
                        <h2 style={{ color: 'var(--text-muted)' }}>No trending data yet</h2>
                        <p>Start reviewing movies to populate the trending list.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {movies.map((movie, index) => (
                            <div key={movie.MovieID} className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                {/* Rank */}
                                <div style={{ fontSize: index < 3 ? '2.5rem' : '1.5rem', fontWeight: '800', minWidth: '60px', textAlign: 'center', color: rankColors[index] || 'var(--text-muted)' }}>
                                    {index < 3 ? medals[index] : `#${index + 1}`}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ margin: '0 0 0.3rem', fontWeight: '800', fontSize: '1.4rem' }}>{movie.TitleNormalized}</h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Last reviewed on {new Date(movie.LastReviewAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>

                                {/* Count */}
                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>{movie.ReviewCount}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reviews</div>
                                </div>

                                {/* Progress bar */}
                                <div style={{ width: '120px', flexShrink: 0 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(100, (movie.ReviewCount / (movies[0]?.ReviewCount || 1)) * 100)}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                                            borderRadius: '10px',
                                            transition: 'width 0.6s ease'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trending;
