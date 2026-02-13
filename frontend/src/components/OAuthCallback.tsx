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
        // Call backend callback endpoint
        const baseUrl = import.meta.env.VITE_API_URL || 'https://ratelimit-api.karol-paschek.workers.dev';
        const response = await fetch(
          `${baseUrl}/auth/oauth/${provider}/callback?code=${code}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'OAuth Login fehlgeschlagen');
        }

        if (data.token) {
          api.setToken(data.token);
          setStatus('success');
          
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
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
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div className="loading" style={{ marginBottom: '1rem' }}>
              Lädt...
            </div>
            <h2>OAuth Anmeldung...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Bitte warten, Sie werden angemeldet.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
            <h2>Erfolgreich angemeldet!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Sie werden weitergeleitet...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>❌</div>
            <h2>Anmeldung fehlgeschlagen</h2>
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {error}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Zurück zur Anmeldung
            </button>
          </>
        )}
      </div>
    </div>
  );
}
