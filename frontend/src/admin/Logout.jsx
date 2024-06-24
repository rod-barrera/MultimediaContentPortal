import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger nav-link" style={{ border: 'none', background: 'none' }}>
      Logout
    </button>
  );
};

export default Logout;