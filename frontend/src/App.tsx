import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { OAuthCallback } from './components/OAuthCallback';
import { HomePage } from './components/HomePage';
import { ChangelogPage } from './components/ChangelogPage';
import { FaqPage } from './components/FaqPage';
import { VergleichPage } from './components/VergleichPage';
import { DocsPage } from './components/DocsPage';
import { PricingPage } from './components/PricingPage';
import { PaymentSuccess } from './components/PaymentSuccess';
import { CloudflareGuide } from './components/blog/CloudflareGuide';
import { AlgorithmsGuide } from './components/blog/AlgorithmsGuide';
import { UseCasesGuide } from './components/blog/UseCasesGuide';
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

  const handleAuthSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => { api.clearToken(); setIsAuthenticated(false); };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Lädt…</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth */}
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Public */}
        <Route path="/"              element={<HomePage />} />
        <Route path="/pricing"       element={<PricingPage />} />
        <Route path="/changelog"     element={<ChangelogPage />} />
        <Route path="/faq"           element={<FaqPage />} />
        <Route path="/vergleich"     element={<VergleichPage />} />
        <Route path="/docs"          element={<DocsPage />} />

        {/* Stripe success page – accessible when logged in or logged out */}
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* Blog */}
        <Route path="/blog/cloudflare-rate-limiting" element={<CloudflareGuide />} />
        <Route path="/blog/rate-limiting-algorithms" element={<AlgorithmsGuide />} />
        <Route path="/blog/api-use-cases"            element={<UseCasesGuide />} />

        <Route path="/login" element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <LoginForm onSuccess={handleAuthSuccess} onToggleMode={() => window.location.href = '/register'} />
        } />
        <Route path="/register" element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <RegisterForm onSuccess={handleAuthSuccess} onToggleMode={() => window.location.href = '/login'} />
        } />

        {/* Protected */}
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
