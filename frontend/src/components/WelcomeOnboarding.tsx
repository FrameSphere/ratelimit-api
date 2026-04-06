import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Phase = 'ring' | 'welcome' | 'choice' | 'tutorial' | 'pro' | 'done';

const TUTORIAL_STEPS = [
  {
    icon: '🔑',
    title: 'API Key erstellen',
    desc: 'Generiere deinen ersten API Key im Dashboard unter "API Keys". Jeder Key kann eigene Rate-Limit-Regeln haben.',
    tip: 'Tipp: Benenne Keys sprechend, z.B. "production-app" oder "dev-test".',
    color: '#6366f1',
  },
  {
    icon: '⚙️',
    title: 'Rate Limit konfigurieren',
    desc: 'Lege fest, wie viele Requests pro Zeitfenster erlaubt sind. Wähle zwischen Sliding Window und Token Bucket.',
    tip: 'Tipp: Starte mit 100 Requests / 60 Sek und passe es nach deinen Logs an.',
    color: '#8b5cf6',
  },
  {
    icon: '🚀',
    title: 'In deine API integrieren',
    desc: 'Sende einen einfachen GET/POST an unseren /check Endpoint mit deinem X-API-Key Header — fertig.',
    tip: 'Tipp: Nutze den Sandbox-Tab im Dashboard zum Testen ohne echte Requests.',
    color: '#06b6d4',
  },
  {
    icon: '📊',
    title: 'Analytics & Alerts',
    desc: 'Beobachte Requests, geblockte IPs und Spitzen in Echtzeit. Richte Webhook-Alerts für kritische Ereignisse ein.',
    tip: 'Tipp: Mit Pro bekommst du 30-Tage-Analytics und CSV-Export.',
    color: '#10b981',
  },
];

const PRO_FEATURES = [
  { icon: '🔑', label: '25 API Keys', sub: 'statt 3 im Free-Plan' },
  { icon: '📊', label: '500K Requests/Monat', sub: 'statt 10K' },
  { icon: '⏳', label: '30 Tage Analytics', sub: 'statt 24 Stunden' },
  { icon: '🔔', label: 'Webhook-Alerts', sub: 'Slack, Discord, Custom' },
  { icon: '📥', label: 'CSV Log-Export', sub: 'für Audits & Compliance' },
  { icon: '⚡', label: 'Adaptive Rate Limits', sub: 'KI-gestützte Empfehlungen' },
];

export function WelcomeOnboarding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('ring');
  const [ringProgress, setRingProgress] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();

  const userName = (() => {
    try {
      const raw = localStorage.getItem('welcome_name');
      return raw ? raw : 'da';
    } catch { return 'da'; }
  })();

  // Ring animation
  useEffect(() => {
    if (phase !== 'ring') return;
    const DURATION = 1600;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setRingProgress(eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase('welcome'), 300);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // welcome → choice after delay
  useEffect(() => {
    if (phase !== 'welcome') return;
    const t = setTimeout(() => setPhase('choice'), 900);
    return () => clearTimeout(t);
  }, [phase]);

  const R = 62;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - ringProgress);

  function lerpColor(t: number): string {
    // purple → cyan → blue
    if (t < 0.5) {
      const u = t / 0.5;
      const r = Math.round(99 + (6 - 99) * u);
      const g = Math.round(102 + (182 - 102) * u);
      const b = Math.round(241 + (212 - 241) * u);
      return `rgb(${r},${g},${b})`;
    } else {
      const u = (t - 0.5) / 0.5;
      const r = Math.round(6 + (99 - 6) * u);
      const g = Math.round(182 + (102 - 182) * u);
      const b = Math.round(212 +(241 - 212) * u);
      return `rgb(${r},${g},${b})`;
    }
  }

  const ringColor = phase === 'ring' ? lerpColor(ringProgress) : '#6366f1';
  const currentStep = TUTORIAL_STEPS[tutorialStep];

  const goToDashboard = () => {
    localStorage.removeItem('onboarding_pending');
    localStorage.removeItem('welcome_name');
    navigate('/dashboard');
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setStepVisible(false);
      setTimeout(() => {
        setTutorialStep(s => s + 1);
        setStepVisible(true);
      }, 220);
    } else {
      setPhase('pro');
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setStepVisible(false);
      setTimeout(() => {
        setTutorialStep(s => s - 1);
        setStepVisible(true);
      }, 220);
    }
  };

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

      {/* Ambient background glow */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700,
          background: `radial-gradient(circle, ${ringColor}15 0%, transparent 65%)`,
          filter: 'blur(60px)',
          transition: 'background 0.6s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, #8b5cf615 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 580, width: '100%' }}>

        {/* ── PHASE: ring + welcome + choice ── */}
        {(phase === 'ring' || phase === 'welcome' || phase === 'choice') && (
          <>
            {/* Ring */}
            <div style={{
              position: 'relative', width: 164, height: 164, margin: '0 auto',
              marginBottom: phase === 'ring' ? '0' : '2.5rem',
              transition: 'margin 0.5s ease',
            }}>
              <svg width="164" height="164" viewBox="0 0 164 164" style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx="82" cy="82" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
              </svg>
              <svg width="164" height="164" viewBox="0 0 164 164" style={{
                position: 'absolute', top: 0, left: 0,
                transform: 'rotate(-90deg)',
              }}>
                <defs>
                  <linearGradient id="wGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="82" cy="82" r={R}
                  fill="none"
                  stroke={phase === 'ring' ? ringColor : 'url(#wGrad)'}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={phase === 'ring' ? dashOffset : 0}
                  style={{
                    transition: phase !== 'ring' ? 'stroke-dashoffset 0.3s ease' : 'none',
                    filter: `drop-shadow(0 0 10px ${ringColor}90)`,
                  }}
                />
              </svg>

              {/* Inner glow */}
              <div style={{
                position: 'absolute', inset: 14, borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)',
                transition: 'background 0.5s',
              }} />

              {/* Icon in center */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: phase === 'welcome' || phase === 'choice' ? 1 : 0,
                transform: phase === 'welcome' || phase === 'choice' ? 'scale(1)' : 'scale(0.5)',
                transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <span style={{ fontSize: '2.8rem' }}>👋</span>
              </div>
            </div>

            {/* Welcome text */}
            <div style={{
              opacity: phase === 'welcome' || phase === 'choice' ? 1 : 0,
              transform: phase === 'welcome' || phase === 'choice' ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}>
              <h1 style={{
                fontSize: '2.2rem', fontWeight: 800, color: 'white',
                marginBottom: '0.6rem', letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}>
                Willkommen bei{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  RateLimit API
                </span>
                {userName !== 'da' ? `, ${userName}` : ''}! 🎉
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem',
                marginBottom: '2.5rem', lineHeight: 1.6,
              }}>
                Dein Account ist bereit. Möchtest du eine kurze Tour durch die wichtigsten Features?
              </p>
            </div>

            {/* Choice buttons */}
            <div style={{
              display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
              opacity: phase === 'choice' ? 1 : 0,
              transform: phase === 'choice' ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.5s ease',
              pointerEvents: phase === 'choice' ? 'auto' : 'none',
            }}>
              <button
                onClick={() => setPhase('tutorial')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', border: 'none', borderRadius: 12,
                  padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px -8px rgba(99,102,241,0.55)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(99,102,241,0.65)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(99,102,241,0.55)';
                }}
              >
                <span>🧭</span> Ja, kurze Tour starten
              </button>
              <button
                onClick={goToDashboard}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '0.9rem 1.75rem', fontSize: '1rem', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                <span>⚡</span> Direkt zum Dashboard
              </button>
            </div>
          </>
        )}

        {/* ── PHASE: tutorial ── */}
        {phase === 'tutorial' && (
          <div style={{
            opacity: 1,
            animation: 'fadeIn 0.4s ease',
          }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === tutorialStep ? 28 : 8,
                  height: 8, borderRadius: 4,
                  background: i === tutorialStep
                    ? currentStep.color
                    : i < tutorialStep ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                }} />
              ))}
            </div>

            {/* Step card */}
            <div style={{
              background: 'rgba(255,255,255,0.035)',
              border: `1px solid ${currentStep.color}30`,
              borderRadius: 20,
              padding: '2.5rem 2rem',
              marginBottom: '1.75rem',
              opacity: stepVisible ? 1 : 0,
              transform: stepVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: `0 0 40px -10px ${currentStep.color}20`,
            }}>
              {/* Step icon */}
              <div style={{
                width: 72, height: 72, borderRadius: 18,
                background: `${currentStep.color}18`,
                border: `1px solid ${currentStep.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', margin: '0 auto 1.5rem',
              }}>
                {currentStep.icon}
              </div>

              <div style={{
                fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
                color: currentStep.color, textTransform: 'uppercase', marginBottom: '0.6rem',
              }}>
                Schritt {tutorialStep + 1} von {TUTORIAL_STEPS.length}
              </div>

              <h2 style={{
                fontSize: '1.65rem', fontWeight: 800, color: 'white',
                marginBottom: '1rem', letterSpacing: '-0.02em',
              }}>
                {currentStep.title}
              </h2>

              <p style={{
                color: 'rgba(255,255,255,0.6)', fontSize: '1rem',
                lineHeight: 1.7, marginBottom: '1.25rem',
              }}>
                {currentStep.desc}
              </p>

              <div style={{
                background: `${currentStep.color}0d`,
                border: `1px solid ${currentStep.color}20`,
                borderRadius: 10, padding: '0.75rem 1rem',
                fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)',
                textAlign: 'left',
              }}>
                💡 {currentStep.tip}
              </div>
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {tutorialStep > 0 && (
                <button
                  onClick={prevTutorialStep}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '0.8rem 1.5rem',
                    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                >
                  ← Zurück
                </button>
              )}
              <button
                onClick={nextTutorialStep}
                style={{
                  background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}cc)`,
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 6px 24px -6px ${currentStep.color}70`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  flex: 1, maxWidth: 220,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                }}
              >
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Weiter →' : 'Abschließen ✓'}
              </button>
            </div>

            <button
              onClick={goToDashboard}
              style={{
                marginTop: '1.25rem', background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem',
                cursor: 'pointer', transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}
            >
              Tour überspringen
            </button>
          </div>
        )}

        {/* ── PHASE: pro upsell ── */}
        {phase === 'pro' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 100, padding: '0.4rem 1rem',
              fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              <span>⚡</span> Starte mit mehr Power
            </div>

            <h2 style={{
              fontSize: '1.9rem', fontWeight: 800, color: 'white',
              marginBottom: '0.5rem', letterSpacing: '-0.02em',
            }}>
              Alles drin mit{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Pro</span>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem',
              marginBottom: '2rem', lineHeight: 1.6,
            }}>
              Ab <strong style={{ color: 'white' }}>€9/Monat</strong> — jederzeit kündbar, kein Risiko.
            </p>

            {/* Feature grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem', marginBottom: '2rem', textAlign: 'left',
            }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={f.label} style={{
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.18)',
                  borderRadius: 12, padding: '0.85rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  opacity: 1,
                  animation: `slideUp 0.4s ease ${i * 0.06}s both`,
                }}>
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{f.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{f.sub}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { localStorage.removeItem('onboarding_pending'); localStorage.removeItem('welcome_name'); navigate('/dashboard?upgrade=1'); }}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: 12,
                  padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px -8px rgba(99,102,241,0.55)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(99,102,241,0.7)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(99,102,241,0.55)';
                }}
              >
                Pro freischalten ⚡
              </button>
              <button
                onClick={goToDashboard}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '0.9rem 1.75rem',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                }}
              >
                Erstmal Free starten →
              </button>
            </div>

            <p style={{
              marginTop: '1.5rem', fontSize: '0.76rem',
              color: 'rgba(255,255,255,0.18)',
            }}>
              Keine Kreditkarte für Free. Pro jederzeit über das Billing-Portal kündbar.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

