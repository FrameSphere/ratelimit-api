import { useState } from 'react';

// ── Code Snippets ──────────────────────────────────────────────────────────────

const SNIPPETS: Record<string, Record<string, string>> = {
  node: {
    install: `npm install @ratelimit-api/sdk`,
    basic: `import { RateLimit } from '@ratelimit-api/sdk';

const rl = new RateLimit({ apiKey: 'rl_YOUR_KEY' });

// Check a request
const result = await rl.check({
  ip: request.ip,
  endpoint: '/api/data',
  method: 'GET',
});

if (!result.allowed) {
  throw new Error(\`Rate limited. Retry in \${result.retryAfter}s\`);
}
console.log(\`\${result.remaining}/\${result.limit} requests remaining\`);`,
    express: `import express from 'express';
import { createExpressMiddleware } from '@ratelimit-api/sdk';

const app = express();

// Protect all routes
app.use(createExpressMiddleware({
  apiKey: 'rl_YOUR_KEY',
  failureMode: 'open', // allow if API unreachable
}));

// Or protect specific routes
app.use('/api/', createExpressMiddleware({
  apiKey: 'rl_YOUR_KEY',
  getIp: (req) => req.headers['x-forwarded-for'] || req.ip,
  onBlocked: (req, res, result) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
    });
  },
}));

app.listen(3000);`,
  },
  nextjs: {
    install: `npm install @ratelimit-api/sdk`,
    middleware: `// middleware.ts (project root)
import { createNextMiddleware } from '@ratelimit-api/sdk';

const rateLimitMiddleware = createNextMiddleware({
  apiKey: process.env.RATELIMIT_API_KEY!,
  failureMode: 'open',
});

export async function middleware(request: Request) {
  const block = await rateLimitMiddleware(request);
  if (block) return block; // 429 response

  // Continue to route handler
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*', // protect all API routes
};`,
    route: `// app/api/data/route.ts
import { RateLimit } from '@ratelimit-api/sdk';

const rl = new RateLimit({ apiKey: process.env.RATELIMIT_API_KEY! });

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  const { allowed, remaining } = await rl.check({
    ip,
    endpoint: '/api/data',
    method: 'GET',
  });

  if (!allowed) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  return Response.json({ data: 'your data here', remaining });
}`,
  },
  cloudflare: {
    install: `# No npm needed — copy the snippet directly`,
    worker: `// worker.ts
import { createCFMiddleware } from '@ratelimit-api/sdk';

const protect = createCFMiddleware({
  apiKey: 'rl_YOUR_KEY',
  failureMode: 'open',
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Rate limit check
    const block = await protect(request);
    if (block) return block; // 429 if rate limited

    // Your handler
    return new Response('Hello World!');
  },
};`,
  },
  python: {
    install: `pip install ratelimit-api`,
    basic: `from ratelimit_api import RateLimit

rl = RateLimit(api_key="rl_YOUR_KEY")

# Sync check
result = rl.check(
    ip=request.remote_addr,
    endpoint=request.path,
    method=request.method,
)

if not result.allowed:
    return {"error": "Too many requests"}, 429`,
    fastapi: `from fastapi import FastAPI, Request, HTTPException
from ratelimit_api import RateLimit

app = FastAPI()
rl = RateLimit(api_key="rl_YOUR_KEY")

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    result = await rl.check_async(
        ip=request.client.host,
        endpoint=str(request.url.path),
        method=request.method,
    )
    if not result.allowed:
        raise HTTPException(status_code=429, detail="Too many requests")
    return await call_next(request)`,
    django: `# middleware.py
from ratelimit_api import RateLimit
from django.http import JsonResponse

rl = RateLimit(api_key="rl_YOUR_KEY")

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        result = rl.check(
            ip=request.META.get('REMOTE_ADDR'),
            endpoint=request.path,
            method=request.method,
        )
        if not result.allowed:
            return JsonResponse({"error": "Too many requests"}, status=429)
        return self.get_response(request)`,
  },
  go: {
    install: `go get github.com/framesphere/ratelimit-api-go`,
    basic: `package main

import (
  "fmt"
  ratelimit "github.com/framesphere/ratelimit-api-go"
)

func main() {
  rl := ratelimit.New(ratelimit.Config{
    APIKey: "rl_YOUR_KEY",
  })

  result, err := rl.Check(ratelimit.CheckOptions{
    IP:       "1.2.3.4",
    Endpoint: "/api/data",
    Method:   "GET",
  })

  if err != nil || !result.Allowed {
    fmt.Println("Rate limited!")
    return
  }
  fmt.Printf("Remaining: %d/%d\\n", result.Remaining, result.Limit)
}`,
    fiber: `package main

import (
  "github.com/gofiber/fiber/v2"
  ratelimit "github.com/framesphere/ratelimit-api-go"
)

func RateLimitMiddleware(rl *ratelimit.Client) fiber.Handler {
  return func(c *fiber.Ctx) error {
    result, _ := rl.Check(ratelimit.CheckOptions{
      IP:       c.IP(),
      Endpoint: c.Path(),
      Method:   c.Method(),
    })
    if !result.Allowed {
      return c.Status(429).JSON(fiber.Map{
        "error": "Too many requests",
      })
    }
    return c.Next()
  }
}`,
  },
  curl: {
    install: `# No installation needed`,
    check: `# Check a request
curl -X GET "https://ratelimit-api.workers.dev/check?endpoint=/api/data&ip=1.2.3.4" \\
  -H "X-API-Key: rl_YOUR_KEY"

# Response:
# {
#   "allowed": true,
#   "limit": 100,
#   "remaining": 99,
#   "resetAt": 1712345678,
#   "algorithm": "sliding_window"
# }`,
    status: `# Check current status (no token consumed)
curl "https://ratelimit-api.workers.dev/check/status?apiKey=rl_YOUR_KEY&endpoint=/api/data"`,
  },
};

// ── Framework tabs ─────────────────────────────────────────────────────────────

const FRAMEWORKS = [
  { id: 'node',       label: 'Node.js',    icon: '🟢', badge: 'Express · Fastify · Hono' },
  { id: 'nextjs',     label: 'Next.js',    icon: '▲',  badge: 'App Router · Middleware' },
  { id: 'cloudflare', label: 'CF Workers', icon: '🟠', badge: 'Workers · Pages' },
  { id: 'python',     label: 'Python',     icon: '🐍', badge: 'FastAPI · Django · Flask' },
  { id: 'go',         label: 'Go',         icon: '🔵', badge: 'Fiber · net/http' },
  { id: 'curl',       label: 'HTTP / cURL', icon: '⚡', badge: 'REST API direkt' },
];

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', color: copied ? '#34d399' : 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
    >
      {copied ? '✓ Kopiert' : '⧉ Kopieren'}
    </button>
  );
}

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  return (
    <div style={{ position: 'relative', borderRadius: 10, background: 'rgba(4,9,20,0.9)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)' }}>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{language}</span>
        <CopyButton text={code} />
      </div>
      <pre style={{ margin: 0, padding: '1rem 1.125rem', overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.7, color: '#e2e8f0', fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function IntegrationsPage() {
  const [activeFramework, setActiveFramework] = useState('node');
  const [activeTab, setActiveTab] = useState<string>('');

  const fw = FRAMEWORKS.find(f => f.id === activeFramework)!;
  const snippets = SNIPPETS[activeFramework] ?? {};
  const tabs = Object.keys(snippets).filter(k => k !== 'install');
  const currentTab = activeTab && tabs.includes(activeTab) ? activeTab : tabs[0];

  const handleFrameworkChange = (id: string) => {
    setActiveFramework(id);
    setActiveTab('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', fontFamily: "'Inter', system-ui, sans-serif", color: 'white' }}>

      {/* ── Hero ── */}
      <div style={{ padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '4px 14px', borderRadius: 100, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          ⚡ SDK & Integrationen
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: 1.1 }}>
          Integration in <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>unter 2 Minuten</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Offizielles SDK für JS/TS, Python und Go. Fertige Middleware für Express, Next.js und Cloudflare Workers.
        </p>

        {/* Quick install */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.25rem', background: 'rgba(4,9,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'monospace', fontSize: '0.9rem', color: '#93c5fd' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>$</span>
          <span>npm install @ratelimit-api/sdk</span>
          <CopyButton text="npm install @ratelimit-api/sdk" />
        </div>
      </div>

      {/* ── Framework selector ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {FRAMEWORKS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFrameworkChange(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 1.125rem', borderRadius: 9, border: '1px solid',
                cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.82rem', fontWeight: 600,
                background: activeFramework === f.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                borderColor: activeFramework === f.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)',
                color: activeFramework === f.id ? '#93c5fd' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{f.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Code panel ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ borderRadius: 16, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>

          {/* Panel header */}
          <div style={{ padding: '1rem 1.375rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{fw.icon}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{fw.label}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{fw.badge}</span>
            </div>
            {snippets.install && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.78rem', color: '#93c5fd', background: 'rgba(4,9,20,0.6)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)' }}>
                {snippets.install}
                <CopyButton text={snippets.install} />
              </div>
            )}
          </div>

          {/* Tab bar */}
          {tabs.length > 1 && (
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.375rem', gap: '0' }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '0.6rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: currentTab === tab ? 700 : 400, color: currentTab === tab ? '#60a5fa' : 'rgba(255,255,255,0.4)', borderBottom: `2px solid ${currentTab === tab ? '#3b82f6' : 'transparent'}`, marginBottom: -1, transition: 'all 0.15s', textTransform: 'capitalize' }}>
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Code */}
          <div style={{ padding: '1.25rem 1.375rem' }}>
            <CodeBlock
              code={snippets[currentTab] ?? ''}
              language={activeFramework === 'python' ? 'python' : activeFramework === 'go' ? 'go' : activeFramework === 'curl' ? 'bash' : 'typescript'}
            />
          </div>
        </div>

        {/* ── Feature highlights ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.875rem', marginTop: '2rem' }}>
          {[
            { icon: '⚡', t: 'Ultra-schnell', d: '<5ms Latenz — kein Einfluss auf Response Time' },
            { icon: '🛡', t: 'Fail-Safe', d: 'failureMode: open — erlaubt bei API-Ausfall' },
            { icon: '🔑', t: 'TypeScript-First', d: 'Vollständige Typen + JSDoc Dokumentation' },
            { icon: '🌍', t: 'Edge-ready', d: 'Funktioniert in CF Workers, Vercel Edge, Deno' },
          ].map(f => (
            <div key={f.t} style={{ padding: '1rem 1.125rem', borderRadius: 12, background: 'rgba(14,22,36,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{f.icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>{f.t}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{f.d}</div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ marginTop: '2.5rem', padding: '2rem', borderRadius: 16, background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.07))', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bereit loszulegen?</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Erstelle einen kostenlosen Account und schütze deine erste API in unter 2 Minuten.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ padding: '0.65rem 1.75rem', borderRadius: 9, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 6px 24px -6px rgba(59,130,246,0.45)' }}>
              Kostenlos starten
            </a>
            <a href="/docs" style={{ padding: '0.65rem 1.5rem', borderRadius: 9, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Dokumentation →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        pre code { display: block; }
        @media (max-width: 640px) {
          .fw-tabs button { font-size: 0.72rem !important; padding: 0.45rem 0.75rem !important; }
        }
      `}</style>
    </div>
  );
}
