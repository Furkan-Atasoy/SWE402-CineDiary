import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5005/api/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.message || 'Check your inputs'));
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '4rem auto'}}>
      <div className="glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2rem' }}>Join the <span className="text-gradient">Club</span></h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="cine_lover" onChange={e => setFormData({...formData, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="email@example.com" onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="primary" style={{width: '100%'}}>Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
