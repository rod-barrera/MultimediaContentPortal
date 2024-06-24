import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [isValidToken, setIsValidToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/validate_token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 200) {
            setIsValidToken(true);
          } else {
            setIsValidToken(false);
            localStorage.removeItem('token');
          }
        } catch (error) {
          setIsValidToken(false);
          localStorage.removeItem('token');
        }
      } else {
        setIsValidToken(false);
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  if (loading) {
    return null; // Puedes mostrar un spinner de carga aquí si lo prefieres
  }

  return isValidToken ? children : <Navigate to="/admin" />;
};

export default PrivateRoute;