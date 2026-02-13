export function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          RateLimit API
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          color: 'var(--text-secondary)',
          marginBottom: '3rem',
          maxWidth: '700px',
          margin: '0 auto 3rem'
        }}>
          Professionelle Rate Limiting Lösung für deine APIs.
          Einfach. Skalierbar. Zuverlässig.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" className="btn btn-primary" style={{
            fontSize: '1.1rem',
            padding: '1rem 2rem',
            textDecoration: 'none'
          }}>
            Jetzt starten
          </a>
          <a href="/login" className="btn btn-secondary" style={{
            fontSize: '1.1rem',
            padding: '1rem 2rem',
            textDecoration: 'none'
          }}>
            Anmelden
          </a>
        </div>
      </div>

      {/* Features */}
      <div style={{
        maxWidth: '1200px',
        margin: '4rem auto',
        padding: '0 2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Feature 1 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" style={{ margin: '0 auto' }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Echtzeit-Kontrolle</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Überwache und steuere deine API-Limits in Echtzeit. Sofortige Anpassungen ohne Deployment.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" style={{ margin: '0 auto' }}>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Flexible Filter</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              IP-Blacklists, Whitelists und User-Agent-Filter. Vollständige Kontrolle über den Zugriff.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" style={{ margin: '0 auto' }}>
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Detaillierte Analytics</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Vollständige Einblicke in deine API-Nutzung mit Echtzeit-Charts und Logs.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{
        maxWidth: '900px',
        margin: '6rem auto',
        padding: '0 2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: '600' }}>
          So funktioniert's
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: 'var(--primary-color)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              flexShrink: 0
            }}>1</div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Account erstellen</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Registriere dich mit Email oder über Google/GitHub OAuth.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: 'var(--primary-color)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              flexShrink: 0
            }}>2</div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>API Key generieren</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Erstelle einen API Key im Dashboard und konfiguriere deine Rate Limits.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{
              background: 'var(--primary-color)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              flexShrink: 0
            }}>3</div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Integrieren & Loslegen</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Füge einen einfachen API-Call zu deiner App hinzu und du bist fertig!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        maxWidth: '800px',
        margin: '6rem auto 4rem',
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '600' }}>
          Bereit zum Starten?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Kostenlos anmelden und in unter 5 Minuten loslegen.
        </p>
        <a href="/register" className="btn btn-primary" style={{
          fontSize: '1.1rem',
          padding: '1rem 2.5rem',
          textDecoration: 'none'
        }}>
          Kostenlos starten
        </a>
      </div>
    </div>
  );
}
