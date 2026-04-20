import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Trending from './pages/Trending';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import UserProfile from './pages/UserProfile';
import './App.css';

// Admin panel: redirect to /admin-login if not an Admin
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role');
  return role === 'Admin' ? children : <Navigate to="/admin-login" />;
};

// Private pages: redirect to /login if not logged in
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trending" element={<Trending />} />

            {/* Admin login page — public but admin-only credential check */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* User only routes */}
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            {/* Admin only routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />

            {/* Public user profile page */}
            <Route path="/user/:userId" element={<UserProfile />} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
           &copy; 2026 CineDiary - Your Cinematic Journal
        </footer>
      </div>
    </Router>
  );
}

export default App;
