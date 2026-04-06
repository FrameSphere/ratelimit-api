import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Phase = 'ring' | 'welcome' | 'choice' | 'tutorial' | 'pro' | 'done';

// ── Inline SVG Icon Components ────────────────────────────────────────────────
const Icon = {
  Key: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  Settings: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Rocket: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  BarChart: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Zap: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  Clock: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Bell: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Download: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Compass: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  ChevronRight: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Lightbulb: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  Wave: ({ size = 44, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 6.5C7.5 8.5 8.5 10 9 10.5"/>
      <path d="M16.5 6.5c0 2-.5 3.5-1.5 4.5"/>
      <path d="M5.5 11.5C6.5 13 8 14 9.5 14"/>
      <path d="M18.5 11.5c-1 1.5-2.5 2.5-4 2.5"/>
      <path d="M5 17.5c2.5 1.5 5.5 2 8.5 1.5"/>
      <path d="M18 17.5C15 19.5 11 20 8.5 19"/>
      <path d="M4 13.5c-.5 1-.5 2 0 3"/>
      <path d="M20 13.5c.5 1 .5 2 0 3"/>
    </svg>
  ),
  Check: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Brain: ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.79A2.5 2.5 0 0 1 5 12a2.5 2.5 0 0 1 1.37-2.22 2.5 2.5 0 0 1 2.13-4.78A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.79A2.5 2.5 0 0 0 19 12a2.5 2.5 0 0 0-1.37-2.22 2.5 2.5 0 0 0-2.13-4.78A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
};

const TUTORIAL_STEPS = [
  {
    icon: <Icon.Key size={32} color="#6366f1" />,
    title: 'API Key erstellen',
    desc: 'Generiere deinen ersten API Key im Dashboard unter "API Keys". Jeder Key kann eigene Rate-Limit-Regeln haben.',
    tip: 'Benenne Keys sprechend, z.B. "production-app" oder "dev-test".',
    color: '#6366f1',
  },
  {
    icon: <Icon.Settings size={32} color="#8b5cf6" />,
    title: 'Rate Limit konfigurieren',
    desc: 'Lege fest, wie viele Requests pro Zeitfenster erlaubt sind. Wähle zwischen Sliding Window und Token Bucket.',
    tip: 'Starte mit 100 Requests / 60 Sek und passe es nach deinen Logs an.',
    color: '#8b5cf6',
  },
  {
    icon: <Icon.Rocket size={32} color="#06b6d4" />,
    title: 'In deine API integrieren',
    desc: 'Sende einen einfachen GET/POST an unseren /check Endpoint mit deinem X-API-Key Header — fertig.',
    tip: 'Nutze den Sandbox-Tab im Dashboard zum Testen ohne echte Requests.',
    color: '#06b6d4',
  },
  {
    icon: <Icon.BarChart size={32} color="#10b981" />,
    title: 'Analytics & Alerts',
    desc: 'Beobachte Requests, geblockte IPs und Spitzen in Echtzeit. Richte Webhook-Alerts für kritische Ereignisse ein.',
    tip: 'Mit Pro bekommst du 30-Tage-Analytics und CSV-Export.',
    color: '#10b981',
  },
];

const PRO_FEATURES = [
  { icon: <Icon.Key size={20} color="#6366f1" />, label: '25 API Keys', sub: 'statt 3 im Free-Plan' },
  { icon: <Icon.BarChart size={20} color="#6366f1" />, label: '500K Requests/Monat', sub: 'statt 10K' },
  { icon: <Icon.Clock size={20} color="#6366f1" />, label: '30 Tage Analytics', sub: 'statt 24 Stunden' },
  { icon: <Icon.Bell size={20} color="#6366f1" />, label: 'Webhook-Alerts', sub: 'Slack, Discord, Custom' },
  { icon: <Icon.Download size={20} color="#6366f1" />, label: 'CSV Log-Export', sub: 'für Audits & Compliance' },
  { icon: <Icon.Brain size={20} color="#6366f1" />, label: 'Adaptive Rate Limits', sub: 'KI-gestützte Empfehlungen' },
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
      const b = Math.round(212 + (241 - 212) * u);
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
                color: '#a5b4fc',
              }}>
                <Icon.Wave size={42} color="#a5b4fc" />
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
                {userName !== 'da' ? `, ${userName}` : ''}!
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
                <Icon.Compass size={18} color="white" />
                Ja, kurze Tour starten
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
                <Icon.Zap size={18} color="rgba(255,255,255,0.6)" />
                Direkt zum Dashboard
              </button>
            </div>
          </>
        )}

        {/* ── PHASE: tutorial ── */}
        {phase === 'tutorial' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
              {TUTORIAL_STEPS.map((step, i) => (
                <div key={i} style={{
                  width: i === tutorialStep ? 28 : 8,
                  height: 8, borderRadius: 4,
                  background: i === tutorialStep
                    ? step.color
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
                margin: '0 auto 1.5rem',
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
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              }}>
                <Icon.Lightbulb size={15} color={currentStep.color} />
                <span>{currentStep.tip}</span>
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
                  transition: 'transform 0.15s',
                  flex: 1, maxWidth: 220,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}
              >
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                  <><span>Weiter</span><Icon.ChevronRight size={18} color="white" /></>
                ) : (
                  <><Icon.Check size={16} color="white" /><span>Abschließen</span></>
                )}
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
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 100, padding: '0.4rem 1rem',
              fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>
              <Icon.Zap size={14} color="#a5b4fc" />
              Starte mit mehr Power
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
                  animation: `slideUp 0.4s ease ${i * 0.06}s both`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: 'rgba(99,102,241,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{f.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{f.sub}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <Icon.Check size={14} color="#6366f1" />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  localStorage.removeItem('onboarding_pending');
                  localStorage.removeItem('welcome_name');
                  navigate('/dashboard?upgrade=1');
                }}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: 12,
                  padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px -8px rgba(99,102,241,0.55)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
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
                <Icon.Zap size={18} color="white" />
                Pro freischalten
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
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
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
                Erstmal Free starten
                <Icon.ChevronRight size={16} color="rgba(255,255,255,0.55)" />
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
