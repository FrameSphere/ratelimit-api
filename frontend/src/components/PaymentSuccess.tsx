import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { PLANS } from '../lib/plans';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'ring' | 'check' | 'features' | 'done'>('ring');
  const [ringProgress, setRingProgress] = useState(0);
  const [plan, setPlan] = useState<any>(null);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();

  // Fetch plan so we can display real feature list
  useEffect(() => {
    api.getSubscriptionStatus().then(({ data }) => {
      if (data?.plan) setPlan(PLANS[data.plan as 'free' | 'pro'] ?? PLANS['pro']);
    });
  }, []);

  // ── Phase orchestration ───────────────────────────────────────────────────
  useEffect(() => {
    // Phase 1: animate ring fill from 0 → 100% over 1.4s
    const RING_DURATION = 1400;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const prog = Math.min(elapsed / RING_DURATION, 1);
      setRingProgress(prog);
      if (prog < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Phase 2: show check after ring is done
        setTimeout(() => setPhase('check'), 200);
        // Phase 3: slide in features
        setTimeout(() => setPhase('features'), 900);
        // Phase 4: show final CTA
        setTimeout(() => setPhase('done'), 1800);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Ring SVG ─────────────────────────────────────────────────────────────
  const R = 60;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - ringProgress);

  // Color interpolation: lila→magenta→grün
  function lerpColor(t: number): string {
    // 0→0.5: #a855f7 → #ec4899
    // 0.5→1: #ec4899 → #22c55e
    if (t < 0.5) {
      const u = t / 0.5;
      const r = Math.round(168 + (236 - 168) * u);
      const g = Math.round(85 + (72 - 85) * u);
      const b = Math.round(247 + (153 - 247) * u);
      return `rgb(${r},${g},${b})`;
    } else {
      const u = (t - 0.5) / 0.5;
      const r = Math.round(236 + (34 - 236) * u);
      const g = Math.round(72 + (197 - 72) * u);
      const b = Math.round(153 + (94 - 153) * u);
      return `rgb(${r},${g},${b})`;
    }
  }

  const ringColor = phase === 'check' || phase === 'features' || phase === 'done'
    ? '#22c55e'
    : lerpColor(ringProgress);

  const proPlan = PLANS['pro'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600,
          background: `radial-gradient(circle, ${ringColor}18 0%, transparent 65%)`,
          filter: 'blur(40px)',
          transition: 'background 0.4s ease',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 560, width: '100%' }}>

        {/* ── Circle Animation ── */}
        <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 2rem' }}>

          {/* Background ring track */}
          <svg
            width="160" height="160"
            viewBox="0 0 160 160"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <circle
              cx="80" cy="80" r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
          </svg>

          {/* Animated ring */}
          <svg
            width="160" height="160"
            viewBox="0 0 160 160"
            style={{
              position: 'absolute', top: 0, left: 0,
              transform: 'rotate(-90deg)',
            }}
          >
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={ringColor} />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <circle
              cx="80" cy="80" r={R}
              fill="none"
              stroke={phase === 'ring' ? ringColor : 'url(#ringGrad)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={phase === 'ring' ? dashOffset : 0}
              style={{
                transition: phase !== 'ring' ? 'stroke-dashoffset 0.1s, stroke 0.5s' : 'none',
                filter: `drop-shadow(0 0 8px ${ringColor}80)`,
              }}
            />
          </svg>

          {/* Center glow circle */}
          <div style={{
            position: 'absolute', inset: 12,
            borderRadius: '50%',
            background: phase === 'check' || phase === 'features' || phase === 'done'
              ? 'rgba(34,197,94,0.12)'
              : `${ringColor}0d`,
            transition: 'background 0.6s ease',
          }} />

          {/* Checkmark */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg
              width="52" height="52" viewBox="0 0 52 52"
              style={{
                opacity: phase === 'check' || phase === 'features' || phase === 'done' ? 1 : 0,
                transform: phase === 'check' || phase === 'features' || phase === 'done'
                  ? 'scale(1) rotate(0deg)' : 'scale(0.4) rotate(-20deg)',
                transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <path
                d="M 10 26 L 21 37 L 42 16"
                fill="none"
                stroke="#22c55e"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: phase === 'check' || phase === 'features' || phase === 'done' ? 0 : 50,
                  transition: 'stroke-dashoffset 0.4s ease 0.1s',
                }}
              />
            </svg>
          </div>
        </div>

        {/* ── Headline ── */}
        <div style={{
          opacity: phase === 'check' || phase === 'features' || phase === 'done' ? 1 : 0,
          transform: phase === 'check' || phase === 'features' || phase === 'done' ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s ease',
        }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: 800, color: 'white',
            marginBottom: '0.5rem', letterSpacing: '-0.03em',
          }}>
            Willkommen im Pro-Plan! 🎉
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
            Dein Upgrade war erfolgreich. Alle Pro-Features sind sofort aktiv.
          </p>
        </div>

        {/* ── Feature Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.875rem',
          marginBottom: '2rem',
          opacity: phase === 'features' || phase === 'done' ? 1 : 0,
          transform: phase === 'features' || phase === 'done' ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {[
            { icon: '🔑', label: '25 API Keys', sub: 'statt 3 im Free' },
            { icon: '📊', label: '500K Requests', sub: 'pro Monat' },
            { icon: '⏳', label: '30 Tage Analytics', sub: 'statt 24 Stunden' },
            { icon: '⚡', label: 'Unbegrenzte Filter', sub: 'und Konfigurationen' },
            { icon: '📥', label: 'CSV-Export', sub: 'Logs herunterladen' },
            { icon: '🔔', label: 'Webhook-Alerts', sub: 'sofortige Benachrichtigungen' },
          ].map((f, i) => (
            <div
              key={f.label}
              style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 12,
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textAlign: 'left',
                opacity: phase === 'features' || phase === 'done' ? 1 : 0,
                transform: phase === 'features' || phase === 'done' ? 'translateY(0)' : 'translateY(16px)',
                transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s`,
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{f.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{f.sub}</div>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Buttons ── */}
        <div style={{
          display: 'flex',
          gap: '0.875rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: phase === 'done' ? 1 : 0,
          transform: phase === 'done' ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.5s ease',
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '0.875rem 2rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 32px -8px rgba(34,197,94,0.5)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(34,197,94,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'none';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(34,197,94,0.5)';
            }}
          >
            Dashboard öffnen →
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLElement).style.color = 'white';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
            }}
          >
            Zurück zur Startseite
          </button>
        </div>

        {/* Fine print */}
        <p style={{
          marginTop: '1.75rem',
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.2)',
          opacity: phase === 'done' ? 1 : 0,
          transition: 'opacity 0.5s ease 0.2s',
        }}>
          Abo-Verwaltung und Kündigung jederzeit über das Billing-Portal im Dashboard.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
