export function HomePage() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background Gradients */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 20s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 15s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 25s ease-in-out infinite'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigation */}
        <nav style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>RateLimit API</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isLoggedIn ? (
              <a href="/dashboard" className="btn btn-primary">Dashboard</a>
            ) : (
              <>
                <a href="/login" className="btn btn-secondary">Anmelden</a>
                <a href="/register" className="btn btn-primary">Kostenlos starten</a>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '6rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '50px',
            padding: '0.5rem 1.5rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            ⚡ Cloudflare Workers • Edge Computing • Global
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Rate Limiting
            </span>
            <br />
            <span style={{ color: 'white' }}>für moderne APIs</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Schütze deine APIs vor Missbrauch und Überlastung. Einfache Integration,
            leistungsstarke Kontrolle und detaillierte Analytics – alles in einer Lösung.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <a href="/register" className="btn btn-primary" style={{
              fontSize: '1.1rem',
              padding: '1rem 2.5rem',
              textDecoration: 'none',
              boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.5)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
            }}>
              Jetzt kostenlos starten →
            </a>
            <a href="#features" className="btn btn-secondary" style={{
              fontSize: '1.1rem',
              padding: '1rem 2.5rem',
              textDecoration: 'none'
            }}>
              Mehr erfahren
            </a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}>99.9%</div>
              <div style={{ color: 'var(--text-secondary)' }}>Uptime</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.5rem' }}>&lt;10ms</div>
              <div style={{ color: 'var(--text-secondary)' }}>Latenz</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#ec4899', marginBottom: '0.5rem' }}>1M+</div>
              <div style={{ color: 'var(--text-secondary)' }}>Requests/Tag</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" style={{
          maxWidth: '1400px',
          margin: '8rem auto',
          padding: '0 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
              Alles was du brauchst
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Professionelles Rate Limiting mit Enterprise-Features für Teams jeder Größe
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {/* Feature 1 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px -10px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>
                Echtzeit-Kontrolle
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Passe deine Rate Limits in Echtzeit an. Keine Code-Änderungen, keine Deployments.
                Sofortige Wirkung auf all deine Endpoints.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px -10px rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>
                Intelligente Filter
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                IP-Blacklists, Whitelists und User-Agent-Filter. Blockiere Bots automatisch
                und erlaube vertrauenswürdige Clients.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(236, 72, 153, 0.02) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px -10px rgba(236, 72, 153, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>
                Detaillierte Analytics
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Vollständige Einblicke in deine API-Nutzung. Echtzeit-Charts, Request-Logs
                und Traffic-Analysen auf einen Blick.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px -10px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>
                Multi-Konfiguration
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Mehrere API Keys mit unterschiedlichen Limits. Perfekt für verschiedene
                Umgebungen oder Kunden-Tiers.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px -10px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>
                Edge Performance
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Läuft auf Cloudflare Workers Edge Network. Minimale Latenz weltweit
                durch globale Verteilung.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px -10px rgba(99, 102, 241, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: 'white' }}>
                Enterprise Security
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                API Keys mit JWT-Tokens, OAuth-Integration und vollständige
                Zugriffskontrolle für dein Team.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{
          maxWidth: '1100px',
          margin: '8rem auto',
          padding: '0 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
              In 3 Schritten zum Ziel
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              Einfacher geht's nicht
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '16px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                flexShrink: 0,
                boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.5)',
                color: 'white'
              }}>1</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '600', color: 'white' }}>
                  Account erstellen
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  Registriere dich kostenlos mit Email oder nutze Google/GitHub OAuth.
                  Keine Kreditkarte erforderlich.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '16px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                flexShrink: 0,
                boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.5)',
                color: 'white'
              }}>2</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '600', color: 'white' }}>
                  API Key konfigurieren
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  Erstelle einen API Key und lege deine Rate Limits fest. Füge Filter hinzu
                  und passe alles nach deinen Bedürfnissen an.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
              <div style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                borderRadius: '16px',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                flexShrink: 0,
                boxShadow: '0 10px 40px -10px rgba(236, 72, 153, 0.5)',
                color: 'white'
              }}>3</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '600', color: 'white' }}>
                  Integrieren & fertig
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  Füge einen einfachen API-Call zu deiner App hinzu und du bist fertig.
                  Code-Beispiele für alle gängigen Sprachen verfügbar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div style={{
          maxWidth: '1100px',
          margin: '8rem auto',
          padding: '0 2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
              Integration in Minuten
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              Einfache Integration in jeder Sprache
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Node.js / Express
            </div>
            <pre style={{
              background: '#0f172a',
              padding: '1.5rem',
              borderRadius: '8px',
              overflow: 'auto',
              margin: 0,
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              <code style={{ color: '#e2e8f0' }}>{`const axios = require('axios');

async function checkRateLimit(apiKey) {
  const response = await axios.get(
    'https://ratelimit-api.karol-paschek.workers.dev/check',
    { headers: { 'X-API-Key': apiKey } }
  );
  return response.data.allowed;
}

// In your middleware
app.use(async (req, res, next) => {
  if (!await checkRateLimit('your-api-key')) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
});`}</code>
            </pre>
          </div>
        </div>

        {/* Pricing Teaser */}
        <div style={{
          maxWidth: '1100px',
          margin: '8rem auto',
          padding: '0 2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '24px',
            padding: '4rem 3rem',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>
              Kostenlos starten
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Keine Kreditkarte erforderlich. Upgrade jederzeit möglich.
              Perfekt für Entwickler, Startups und Unternehmen.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" className="btn btn-primary" style={{
                fontSize: '1.2rem',
                padding: '1.25rem 3rem',
                textDecoration: 'none',
                boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.5)',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              }}>
                Jetzt durchstarten →
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          marginTop: '8rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2">
                  <defs>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>RateLimit API</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <a href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Anmelden</a>
              <a href="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Registrieren</a>
              <a href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Dashboard</a>
              <a href="/impressum" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Impressum</a>
              <a href="/datenschutz" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Datenschutz</a>
              <a href="https://github.com/FrameSphere/ratelimit-api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>GitHub</a>
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              © 2026 RateLimit API. Powered by{' '}<a href="https://frame-sphere.vercel.app" className="footer-link" target="_blank" rel="noopener noreferrer">FrameSphere</a>.
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
