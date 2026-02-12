import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { OAuthCallback } from './components/OAuthCallback';
import { api } from './lib/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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
        {/* OAuth Callback Route - always accessible */}
        <Route path="/auth/callback" element={<OAuthCallback />} />
        
        {/* Protected Dashboard Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : authMode === 'login' ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onToggleMode={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onToggleMode={() => setAuthMode('login')}
              />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
