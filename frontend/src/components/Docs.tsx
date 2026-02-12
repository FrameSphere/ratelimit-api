export function Docs() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '280px',
        position: 'sticky',
        top: '2rem',
        height: 'fit-content',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Inhaltsverzeichnis</h3>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('quickstart')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                Quick Start
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('auth')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Authentifizierung
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('apikeys')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                API Keys
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('ratelimit')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Rate Limit Check
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('configs')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
                </svg>
                Konfigurationen
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('filters')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('analytics')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Analytics
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('examples')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                Code Beispiele
              </button>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={() => scrollToSection('errors')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Status Codes
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('support')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  width: '100%',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Support
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="card" style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          RateLimit API Dokumentation
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Vollständige Anleitung zur Nutzung der RateLimit API
        </p>

        {/* Quick Start */}
        <section id="quickstart" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Quick Start
          </h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Registriere dich oder melde dich an</li>
            <li>Erstelle einen API Key im Dashboard</li>
            <li>Konfiguriere deine Rate Limits</li>
            <li>Integriere die API in deine Anwendung</li>
          </ol>
        </section>

        {/* Authentication */}
        <section id="auth" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Authentifizierung
          </h2>
          
          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Registrierung</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`POST https://ratelimit-api.karol-paschek.workers.dev/auth/register

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Max Mustermann"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Max Mustermann"
  }
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Login</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`POST https://ratelimit-api.karol-paschek.workers.dev/auth/login

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>OAuth Login</h3>
          <p>Unterstützte Provider: Google, GitHub, FrameSphere</p>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`GET https://ratelimit-api.karol-paschek.workers.dev/auth/oauth/google
GET https://ratelimit-api.karol-paschek.workers.dev/auth/oauth/github
GET https://ratelimit-api.karol-paschek.workers.dev/auth/oauth/framesphere`}
          </pre>
        </section>

        {/* API Keys */}
        <section id="apikeys" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            API Keys
          </h2>
          
          <p style={{ marginBottom: '1rem' }}>
            Alle API Key Endpoints benötigen einen JWT Token im Authorization Header.
          </p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>API Key erstellen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`POST https://ratelimit-api.karol-paschek.workers.dev/api/keys
Authorization: Bearer YOUR_JWT_TOKEN

{
  "keyName": "Production API"
}

Response:
{
  "apiKey": {
    "id": 1,
    "api_key": "rla_live_abc123...",
    "key_name": "Production API",
    "is_active": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>API Keys abrufen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`GET https://ratelimit-api.karol-paschek.workers.dev/api/keys
Authorization: Bearer YOUR_JWT_TOKEN

Response:
{
  "apiKeys": [
    {
      "id": 1,
      "api_key": "rla_live_abc123...",
      "key_name": "Production API",
      "is_active": 1,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>API Key löschen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`DELETE https://ratelimit-api.karol-paschek.workers.dev/api/keys/:id
Authorization: Bearer YOUR_JWT_TOKEN`}
          </pre>
        </section>

        {/* Rate Limit Check */}
        <section id="ratelimit" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Rate Limit Check
          </h2>
          
          <p style={{ marginBottom: '1rem' }}>
            Überprüfe ob eine Anfrage erlaubt ist. Dies ist der Haupt-Endpoint den du in deiner App nutzt.
          </p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>GET Request</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`GET https://ratelimit-api.karol-paschek.workers.dev/check
X-API-Key: rla_live_abc123...

Response (Erlaubt):
{
  "allowed": true,
  "remaining": 95,
  "limit": 100,
  "reset": 1642242600
}

Response (Blockiert):
{
  "allowed": false,
  "remaining": 0,
  "limit": 100,
  "reset": 1642242600,
  "retry_after": 3600
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>POST Request</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`POST https://ratelimit-api.karol-paschek.workers.dev/check
X-API-Key: rla_live_abc123...
Content-Type: application/json

{
  "identifier": "user@example.com"  // Optional: Custom identifier
}`}
          </pre>
        </section>

        {/* Configurations */}
        <section id="configs" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H5m13.2 5.2l-4.2-4.2m0-6l4.2-4.2"/>
            </svg>
            Konfigurationen
          </h2>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Konfiguration erstellen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`POST https://ratelimit-api.karol-paschek.workers.dev/api/configs
Authorization: Bearer YOUR_JWT_TOKEN

{
  "apiKeyId": 1,
  "name": "Standard Limit",
  "maxRequests": 100,
  "windowSeconds": 3600
}

Response:
{
  "config": {
    "id": 1,
    "name": "Standard Limit",
    "max_requests": 100,
    "window_seconds": 3600,
    "enabled": 1
  }
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Konfigurationen abrufen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`GET https://ratelimit-api.karol-paschek.workers.dev/api/configs/:apiKeyId
Authorization: Bearer YOUR_JWT_TOKEN`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Konfiguration aktualisieren</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`PUT https://ratelimit-api.karol-paschek.workers.dev/api/configs/:id
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Updated Limit",
  "max_requests": 200,
  "window_seconds": 3600,
  "enabled": 1
}`}
          </pre>
        </section>

        {/* Filters */}
        <section id="filters" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
          </h2>

          <p style={{ marginBottom: '1rem' }}>
            Filter erlauben es dir spezifische IPs, User Agents oder andere Kriterien zu blockieren oder zu erlauben.
          </p>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Filter erstellen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`POST https://ratelimit-api.karol-paschek.workers.dev/api/filters
Authorization: Bearer YOUR_JWT_TOKEN

{
  "configId": 1,
  "ruleType": "ip_blacklist",  // ip_blacklist, ip_whitelist, user_agent
  "ruleValue": "192.168.1.100",
  "action": "block"  // block, allow
}

Response:
{
  "filter": {
    "id": 1,
    "rule_type": "ip_blacklist",
    "rule_value": "192.168.1.100",
    "action": "block"
  }
}`}
          </pre>
        </section>

        {/* Analytics */}
        <section id="analytics" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Analytics
          </h2>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Analytics abrufen</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`GET https://ratelimit-api.karol-paschek.workers.dev/api/analytics/:apiKeyId?range=24h
Authorization: Bearer YOUR_JWT_TOKEN

Range options: 24h, 7d, 30d

Response:
{
  "total": 1250,
  "blocked": 45,
  "uniqueIps": 127,
  "chart": [
    {
      "hour": "2024-01-15T10:00:00Z",
      "requests": 85,
      "blocked": 3
    }
  ]
}`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Request Logs</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`GET https://ratelimit-api.karol-paschek.workers.dev/api/logs/:apiKeyId?limit=50
Authorization: Bearer YOUR_JWT_TOKEN`}
          </pre>
        </section>

        {/* Integration Examples */}
        <section id="examples" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Integration Beispiele
          </h2>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Node.js / Express</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`const axios = require('axios');

async function checkRateLimit(apiKey) {
  try {
    const response = await axios.get(
      'https://ratelimit-api.karol-paschek.workers.dev/check',
      {
        headers: {
          'X-API-Key': apiKey
        }
      }
    );
    
    return response.data.allowed;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
}

// In your Express middleware
app.use(async (req, res, next) => {
  const allowed = await checkRateLimit('rla_live_abc123...');
  
  if (!allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
});`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Python / Flask</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`import requests
from functools import wraps
from flask import jsonify

API_KEY = 'rla_live_abc123...'
API_URL = 'https://ratelimit-api.karol-paschek.workers.dev/check'

def check_rate_limit():
    try:
        response = requests.get(
            API_URL,
            headers={'X-API-Key': API_KEY}
        )
        return response.json().get('allowed', False)
    except:
        return False

def rate_limit_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not check_rate_limit():
            return jsonify({'error': 'Rate limit exceeded'}), 429
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/data')
@rate_limit_required
def get_data():
    return jsonify({'data': 'your data here'})`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>JavaScript / Fetch</h3>
          <pre style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`async function checkRateLimit(apiKey) {
  const response = await fetch(
    'https://ratelimit-api.karol-paschek.workers.dev/check',
    {
      headers: {
        'X-API-Key': apiKey
      }
    }
  );
  
  const data = await response.json();
  return data.allowed;
}

// Usage
const allowed = await checkRateLimit('rla_live_abc123...');
if (!allowed) {
  console.log('Rate limit exceeded!');
}`}
          </pre>
        </section>

        {/* Error Codes */}
        <section id="errors" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            HTTP Status Codes
          </h2>
          
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Bedeutung</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>200</code></td>
                <td>Erfolgreiche Anfrage</td>
              </tr>
              <tr>
                <td><code>201</code></td>
                <td>Ressource erstellt</td>
              </tr>
              <tr>
                <td><code>400</code></td>
                <td>Ungültige Anfrage</td>
              </tr>
              <tr>
                <td><code>401</code></td>
                <td>Nicht authentifiziert</td>
              </tr>
              <tr>
                <td><code>403</code></td>
                <td>Zugriff verweigert</td>
              </tr>
              <tr>
                <td><code>404</code></td>
                <td>Ressource nicht gefunden</td>
              </tr>
              <tr>
                <td><code>429</code></td>
                <td>Rate Limit überschritten</td>
              </tr>
              <tr>
                <td><code>500</code></td>
                <td>Serverfehler</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Support */}
        <section id="support" style={{ scrollMarginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Support
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            Bei Fragen oder Problemen kontaktiere uns:
          </p>
          <ul style={{ lineHeight: '1.8' }}>
            <li>GitHub: <a href="https://github.com/FrameSphere/ratelimit-api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>github.com/FrameSphere/ratelimit-api</a></li>
            <li>Email: support@ratelimit-api.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
