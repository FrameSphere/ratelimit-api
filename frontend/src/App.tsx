import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
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

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginForm
        onSuccess={handleAuthSuccess}
        onToggleMode={() => setAuthMode('register')}
      />
    ) : (
      <RegisterForm
        onSuccess={handleAuthSuccess}
        onToggleMode={() => setAuthMode('login')}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}
