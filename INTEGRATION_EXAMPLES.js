// Beispiel: RateLimit API Integration in deiner eigenen Anwendung

/**
 * Diese Datei zeigt verschiedene Integrationsmöglichkeiten
 * für die RateLimit API in deinen Projekten
 */

// ===========================
// 1. Node.js / Express Beispiel
// ===========================

const express = require('express');
const app = express();

const RATELIMIT_API_URL = 'https://your-worker.workers.dev';
const API_KEY = 'rlapi_your_key_here';

// Middleware für RateLimit Check
async function rateLimitMiddleware(req, res, next) {
  try {
    const response = await fetch(
      `${RATELIMIT_API_URL}/check?endpoint=${req.path}&method=${req.method}`,
      {
        headers: {
          'X-API-Key': API_KEY,
        },
      }
    );

    const data = await response.json();

    // Rate Limit Headers hinzufügen
    res.setHeader('X-RateLimit-Remaining', data.remaining);
    res.setHeader('X-RateLimit-Reset', data.resetAt);

    if (!data.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: data.resetAt - Math.floor(Date.now() / 1000),
      });
    }

    next();
  } catch (error) {
    console.error('RateLimit check failed:', error);
    // Bei Fehler durchlassen (fail-open)
    next();
  }
}

// Auf bestimmte Routen anwenden
app.use('/api/', rateLimitMiddleware);

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// ===========================
// 2. Cloudflare Worker Beispiel
// ===========================

const WORKER_RATELIMIT_API_URL = 'https://your-worker.workers.dev';
const WORKER_API_KEY = 'rlapi_your_key_here';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // RateLimit prüfen
  const rateLimitResponse = await fetch(
    `${WORKER_RATELIMIT_API_URL}/check?endpoint=${url.pathname}&method=${request.method}`,
    {
      headers: {
        'X-API-Key': WORKER_API_KEY,
      },
    }
  );

  const rateLimitData = await rateLimitResponse.json();

  if (!rateLimitData.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        resetAt: rateLimitData.resetAt,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitData.resetAt.toString(),
        },
      }
    );
  }

  // Normale Anfrage bearbeiten
  return new Response('Hello World!', {
    headers: {
      'X-RateLimit-Remaining': rateLimitData.remaining.toString(),
      'X-RateLimit-Reset': rateLimitData.resetAt.toString(),
    },
  });
}

// ===========================
// 3. Next.js API Route Beispiel
// ===========================

// pages/api/protected-route.js
export default async function handler(req, res) {
  const RATELIMIT_API = 'https://your-worker.workers.dev';
  const API_KEY = 'rlapi_your_key_here';

  // RateLimit prüfen
  const rateLimitRes = await fetch(
    `${RATELIMIT_API}/check?endpoint=${req.url}&method=${req.method}`,
    {
      headers: {
        'X-API-Key': API_KEY,
        'CF-Connecting-IP': req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      },
    }
  );

  const rateLimitData = await rateLimitRes.json();

  // Headers setzen
  res.setHeader('X-RateLimit-Remaining', rateLimitData.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimitData.resetAt);

  if (!rateLimitData.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: rateLimitData.resetAt - Math.floor(Date.now() / 1000),
    });
  }

  // Normale API Response
  res.status(200).json({ message: 'Success' });
}

// ===========================
// 4. React Frontend Beispiel
// ===========================

import { useState, useEffect } from 'react';

function useRateLimit() {
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  const checkRateLimit = async (endpoint, method = 'GET') => {
    try {
      const response = await fetch(
        `https://your-worker.workers.dev/check?endpoint=${endpoint}&method=${method}`,
        {
          headers: {
            'X-API-Key': 'rlapi_your_key_here',
          },
        }
      );

      const data = await response.json();
      setRateLimitInfo(data);
      return data;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return null;
    }
  };

  return { rateLimitInfo, checkRateLimit };
}

// Verwendung in Komponente
function MyComponent() {
  const { rateLimitInfo, checkRateLimit } = useRateLimit();

  const handleApiCall = async () => {
    const rateLimit = await checkRateLimit('/api/data', 'GET');

    if (!rateLimit?.allowed) {
      alert('Rate limit exceeded. Please try again later.');
      return;
    }

    // API Call durchführen
    // ...
  };

  return (
    <div>
      <button onClick={handleApiCall}>Make API Call</button>
      {rateLimitInfo && (
        <div>
          <p>Remaining: {rateLimitInfo.remaining}</p>
          <p>Reset at: {new Date(rateLimitInfo.resetAt * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// ===========================
// 5. Python / Flask Beispiel
// ===========================

/*
from flask import Flask, request, jsonify
import requests
import time

app = Flask(__name__)

RATELIMIT_API_URL = 'https://your-worker.workers.dev'
API_KEY = 'rlapi_your_key_here'

def check_rate_limit(endpoint, method):
    try:
        response = requests.get(
            f'{RATELIMIT_API_URL}/check',
            params={'endpoint': endpoint, 'method': method},
            headers={'X-API-Key': API_KEY}
        )
        return response.json()
    except Exception as e:
        print(f'Rate limit check failed: {e}')
        return None

@app.before_request
def rate_limit_check():
    rate_limit_data = check_rate_limit(request.path, request.method)
    
    if rate_limit_data and not rate_limit_data.get('allowed'):
        return jsonify({
            'error': 'Rate limit exceeded',
            'retry_after': rate_limit_data.get('resetAt', 0) - int(time.time())
        }), 429

@app.route('/api/users')
def get_users():
    return jsonify({'users': []})

if __name__ == '__main__':
    app.run()
*/

// ===========================
// 6. CLI / CURL Beispiel
// ===========================

/*
# Einfacher Check
curl -H "X-API-Key: rlapi_your_key_here" \
     "https://your-worker.workers.dev/check?endpoint=/api/users&method=GET"

# Mit Pretty Print
curl -H "X-API-Key: rlapi_your_key_here" \
     "https://your-worker.workers.dev/check?endpoint=/api/users&method=GET" \
     | jq

# In Loop (Testing)
for i in {1..10}; do
  curl -H "X-API-Key: rlapi_your_key_here" \
       "https://your-worker.workers.dev/check?endpoint=/api/test&method=GET"
  echo ""
  sleep 1
done
*/

// ===========================
// 7. Fehlerbehandlung Best Practices
// ===========================

async function robustRateLimitCheck(endpoint, method) {
  const MAX_RETRIES = 3;
  const TIMEOUT = 5000; // 5 Sekunden

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const response = await fetch(
        `${RATELIMIT_API_URL}/check?endpoint=${endpoint}&method=${method}`,
        {
          headers: { 'X-API-Key': API_KEY },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Rate limit check attempt ${attempt} failed:`, error);

      if (attempt === MAX_RETRIES) {
        // Fail-open: Bei wiederholten Fehlern durchlassen
        console.warn('Rate limit check failed, allowing request');
        return { allowed: true, remaining: -1, resetAt: 0 };
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}

// ===========================
// 8. Caching Beispiel (Optimierung)
// ===========================

class RateLimitCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_TTL = 60000; // 1 Minute
  }

  getCacheKey(endpoint, method) {
    return `${endpoint}:${method}`;
  }

  get(endpoint, method) {
    const key = this.getCacheKey(endpoint, method);
    const cached = this.cache.get(key);

    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(endpoint, method, data) {
    const key = this.getCacheKey(endpoint, method);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async checkRateLimit(endpoint, method) {
    // Versuche aus Cache zu lesen
    const cached = this.get(endpoint, method);
    if (cached && cached.allowed) {
      return cached;
    }

    // Mache echten API Call
    const data = await robustRateLimitCheck(endpoint, method);
    this.set(endpoint, method, data);
    return data;
  }
}

const rateLimitCache = new RateLimitCache();

// ===========================
// 9. Monitoring & Metrics
// ===========================

class RateLimitMonitor {
  constructor() {
    this.metrics = {
      totalChecks: 0,
      allowed: 0,
      blocked: 0,
      errors: 0,
    };
  }

  async checkWithMetrics(endpoint, method) {
    this.metrics.totalChecks++;

    try {
      const result = await robustRateLimitCheck(endpoint, method);

      if (result.allowed) {
        this.metrics.allowed++;
      } else {
        this.metrics.blocked++;
      }

      return result;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      blockRate: (this.metrics.blocked / this.metrics.totalChecks) * 100 || 0,
      errorRate: (this.metrics.errors / this.metrics.totalChecks) * 100 || 0,
    };
  }

  reset() {
    this.metrics = {
      totalChecks: 0,
      allowed: 0,
      blocked: 0,
      errors: 0,
    };
  }
}

// Verwendung
const monitor = new RateLimitMonitor();

// Periodisch Metrics loggen
setInterval(() => {
  console.log('Rate Limit Metrics:', monitor.getMetrics());
}, 60000); // Jede Minute

// ===========================
// 10. Webhook Integration (Advanced)
// ===========================

// Webhook Handler für Benachrichtigungen bei Rate Limit Events
async function sendWebhookNotification(event, data) {
  const WEBHOOK_URL = 'https://your-webhook-url.com/notifications';

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: Date.now(),
        data,
      }),
    });
  } catch (error) {
    console.error('Webhook notification failed:', error);
  }
}

// Bei Rate Limit Überschreitung
async function handleRateLimitExceeded(endpoint, method, rateLimitData) {
  await sendWebhookNotification('rate_limit_exceeded', {
    endpoint,
    method,
    remaining: rateLimitData.remaining,
    resetAt: rateLimitData.resetAt,
  });
}

module.exports = {
  rateLimitMiddleware,
  robustRateLimitCheck,
  RateLimitCache,
  RateLimitMonitor,
  handleRateLimitExceeded,
};
