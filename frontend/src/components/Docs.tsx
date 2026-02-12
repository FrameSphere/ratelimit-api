export function Docs() {
  return (
    <div className="container" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <div className="card">
        <h1 style={{ marginBottom: '1rem' }}>📚 RateLimit API Dokumentation</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Vollständige Anleitung zur Nutzung der RateLimit API
        </p>

        {/* Quick Start */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            🚀 Quick Start
          </h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Registriere dich oder melde dich an</li>
            <li>Erstelle einen API Key im Dashboard</li>
            <li>Konfiguriere deine Rate Limits</li>
            <li>Integriere die API in deine Anwendung</li>
          </ol>
        </section>

        {/* Authentication */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            🔐 Authentifizierung
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            🔑 API Keys
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            ⚡ Rate Limit Check
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            ⚙️ Konfigurationen
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            🔍 Filter
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            📊 Analytics
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            💻 Integration Beispiele
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
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            ⚠️ HTTP Status Codes
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
        <section>
          <h2 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary-color)' }}>
            💬 Support
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
