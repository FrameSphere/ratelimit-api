import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const provider = searchParams.get('provider');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(`OAuth Fehler: ${errorParam}`);
        return;
      }

      if (!code || !provider) {
        setStatus('error');
        setError('Fehlende OAuth-Parameter');
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://ratelimit-api.karol-paschek.workers.dev';
        const response = await fetch(
          `${baseUrl}/auth/oauth/${provider}/callback?code=${code}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'OAuth Login fehlgeschlagen');
        }

        if (data.token) {
          api.setToken(data.token);
          setStatus('success');

          setTimeout(() => {
            // FrameSphere SSO → always show the connect animation page
            if (provider === 'framesphere') {
              window.location.href = '/sso-welcome';
              return;
            }
            // Other providers
            if (data.isNewUser) {
              localStorage.setItem('onboarding_pending', '1');
              if (data.user?.name) localStorage.setItem('welcome_name', data.user.name);
              window.location.href = '/welcome';
            } else {
              window.location.href = '/dashboard';
            }
          }, 600);
        } else {
          throw new Error('Kein Token erhalten');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: 48, height: 48,
              border: '3px solid rgba(168,85,247,0.2)',
              borderTopColor: '#a855f7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.5rem',
            }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>Wird angemeldet…</h2>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>Bitte einen Moment warten.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>Erfolgreich!</h2>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>Du wirst weitergeleitet…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>Anmeldung fehlgeschlagen</h2>
            <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.625rem 1.5rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              Zurück zur Anmeldung
            </button>
          </>
        )}
      </div>
    </div>
  );
}
