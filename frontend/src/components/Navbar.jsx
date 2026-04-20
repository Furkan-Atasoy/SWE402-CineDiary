import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
         <span style={{color: 'var(--accent)'}}>●</span> CineDiary
      </Link>
       <div className="nav-links">
        {role !== 'Admin' && (
          <>
            <Link to="/">Explore Feed</Link>
            <Link to="/trending">Trending 🔥</Link>
          </>
        )}
        
        {token ? (
          <>
            {role !== 'Admin' && <Link to="/profile">My Diary</Link>}
            {role === 'Admin' && <Link to="/admin" className="text-gradient" style={{fontWeight: '800', fontSize: '1.4rem'}}>Admin</Link>}
            <button onClick={handleLogout} className="logout-btn">
               Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
