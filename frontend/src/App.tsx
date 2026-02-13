import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { OAuthCallback } from './components/OAuthCallback';
import { HomePage } from './components/HomePage';
import { api } from './lib/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const { data } = await api.getProfile();
      if (data?.user) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    api.clearToken();
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        Lädt...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<OAuthCallback />} />
        
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm onSuccess={handleAuthSuccess} onToggleMode={() => window.location.href = '/register'} />
          )
        } />
        <Route path="/register" element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} onToggleMode={() => window.location.href = '/login'} />
          )
        } />
        
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
