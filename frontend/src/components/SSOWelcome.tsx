import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, BarChart3, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

type Phase = 'idle' | 'logos' | 'connecting' | 'connected' | 'features' | 'cta';

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

const FEATURES = [
  { icon: Shield,   title: 'Rate Limiting',       desc: 'Schütze deine API vor Missbrauch mit konfigurierbaren Request-Limits pro Zeitfenster.',   color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  { icon: Zap,      title: 'Token Bucket',         desc: 'Burst-Anfragen erlaubt, Dauerlast begrenzt — flexibles Rate-Limiting via Token Bucket.',    color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)' },
  { icon: BarChart3,title: 'Live Analytics',       desc: 'Echtzeit-Dashboard mit Logs, IP-Statistiken und blockierten Anfragen auf einen Blick.',      color: '#22d3ee', bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.2)'  },
  { icon: Lock,     title: 'FrameSphere Connected',desc: 'Dein FrameSphere-Konto ist verknüpft — ein Account, alle Tools, ein Login.',                color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
];

// ─── Logo: RateLimit API ───────────────────────────────────────────────────────
function RateLimitLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(-60px) scale(0.8)',
      transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}`,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #059669, #34d399)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(52,211,153,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        <Shield size={36} color="white" />
        <div style={{ position: 'absolute', inset: -1, borderRadius: 21, background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents: 'none' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>RateLimit API</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>API-Schutz & Analytics</div>
      </div>
    </div>
  );
}

// ─── Logo: FrameSphere ────────────────────────────────────────────────────────
function FrameSphereLogo({ visible }: { visible: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.8)',
      transition: `opacity 0.7s ${ease} 0.15s, transform 0.7s ${ease} 0.15s`,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #6d28d9, #c026d3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(192,38,211,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        <span style={{ color: 'white', fontWeight: 900, fontSize: 26, letterSpacing: '-1px' }}>FS</span>
        <div style={{ position: 'absolute', inset: -1, borderRadius: 21, background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)', pointerEvents: 'none' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>FrameSphere</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Dein Account-Hub</div>
      </div>
    </div>
  );
}

// ─── Connection Line ──────────────────────────────────────────────────────────
function ConnectionLine({ phase }: { phase: Phase }) {
  const drawing = phase === 'connecting' || phase === 'connected' || phase === 'features' || phase === 'cta';
  const done    = phase === 'connected'  || phase === 'features' || phase === 'cta';
  const checkTransform = done ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)';

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 120 }}>
      <div style={{ position: 'relative', width: '100%', height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        {/* Animated fill — green for RateLimit */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 2,
          background: 'linear-gradient(90deg, #059669, #34d399)',
          transformOrigin: 'left center',
          transform: drawing ? 'scaleX(1)' : 'scaleX(0)',
          transition: drawing ? `transform 0.6s ${ease}` : 'none',
          boxShadow: drawing ? '0 0 10px rgba(52,211,153,0.8)' : 'none',
        }} />
        {/* Traveling dot */}
        {drawing && !done && (
          <div style={{
            position: 'absolute', top: '50%',
            width: 8, height: 8, borderRadius: '50%',
            background: 'white', boxShadow: '0 0 12px rgba(255,255,255,0.9)',
            transform: 'translateY(-50%)',
            animation: 'travelDot 0.6s ease-out forwards',
          }} />
        )}
      </div>
      {/* Checkmark */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 28, height: 28, borderRadius: '50%',
        background: done ? 'linear-gradient(135deg, #059669, #34d399)' : 'transparent',
        border: done ? 'none' : '2px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: done ? 1 : 0,
        transform: checkTransform,
        transition: `opacity 0.4s ${ease}, transform 0.5s ${ease}`,
        boxShadow: done ? '0 0 20px rgba(52,211,153,0.6)' : 'none',
      }}>
        <CheckCircle size={16} color="white" strokeWidth={2.5} />
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color, bg, border, delay, visible }: {
  icon: any; title: string; desc: string; color: string; bg: string; border: string; delay: number; visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '18px 20px', borderRadius: 16,
        background: hovered ? `linear-gradient(135deg, ${bg}, rgba(255,255,255,0.03))` : bg,
        border: `1px solid ${hovered ? color + '44' : border}`,
        backdropFilter: 'blur(12px)', cursor: 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
        transition: `opacity 0.5s ${ease} ${delay}ms, transform 0.5s ${ease} ${delay}ms, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease`,
        boxShadow: hovered ? `0 8px 32px ${color}22` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
          transition: 'transform 0.25s ease',
        }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
          <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SSOWelcome() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase('logos'),      150));
    t.push(setTimeout(() => setPhase('connecting'), 950));
    t.push(setTimeout(() => setPhase('connected'),  1650));
    t.push(setTimeout(() => setPhase('features'),   2250));
    t.push(setTimeout(() => setPhase('cta'),        2950));
    return () => t.forEach(clearTimeout);
  }, []);

  const showLogos    = phase !== 'idle';
  const showLabel    = phase === 'connected' || phase === 'features' || phase === 'cta';
  const showHeadline = phase === 'features' || phase === 'cta';
  const showFeatures = phase === 'features' || phase === 'cta';
  const showCta      = phase === 'cta';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes travelDot  { from { left: 0%; } to { left: 100%; } }
        @keyframes orbPulse   { 0%,100% { opacity:.35; transform:scale(1); } 50% { opacity:.65; transform:scale(1.07); } }
        @keyframes shimmerBtn { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: '#030712', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', top: '-150px', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)', animation: 'orbPulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '-80px', right: '15%', background: 'radial-gradient(circle, rgba(192,38,211,0.1) 0%, transparent 70%)', animation: 'orbPulse 11s ease-in-out infinite 2s' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <main style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* ── Animation Block ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>

            {/* Logos + Line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' }}>
              <RateLimitLogo visible={showLogos} />
              <ConnectionLine phase={phase} />
              <FrameSphereLogo visible={showLogos} />
            </div>

            {/* Badge */}
            <div style={{
              opacity: showLabel ? 1 : 0,
              transform: showLabel ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
              transition: `opacity 0.5s ${ease}, transform 0.5s ${ease}`,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 100,
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            }}>
              <CheckCircle size={15} color="#34d399" />
              <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>Erfolgreich verbunden</span>
            </div>

            {/* Headline */}
            <div style={{
              textAlign: 'center',
              opacity: showHeadline ? 1 : 0,
              transform: showHeadline ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.5s ${ease} 0.1s, transform 0.5s ${ease} 0.1s`,
            }}>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(26px, 5vw, 38px)',
                fontWeight: 900, color: '#f1f5f9',
                lineHeight: 1.2, letterSpacing: '-1px', marginBottom: 12,
              }}>
                Dein FrameSphere-Konto<br />
                <span style={{ background: 'linear-gradient(90deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ist jetzt verknüpft.
                </span>
              </h1>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
                Melde dich ab sofort mit einem Klick über FrameSphere bei der RateLimit API an —
                ohne separates Passwort. Dein Account ist eingerichtet.
              </p>
            </div>
          </div>

          {/* ── Feature Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} visible={showFeatures} />
            ))}
          </div>

          {/* ── CTA ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            opacity: showCta ? 1 : 0,
            transform: showCta ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.5s ${ease}, transform 0.5s ${ease}`,
          }}>
            <button
              onClick={() => navigate('/dashboard')}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                padding: '16px 48px', borderRadius: 14, border: 'none', cursor: 'pointer',
                fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: 'white',
                background: 'linear-gradient(135deg, #059669, #34d399, #06b6d4, #34d399, #059669)',
                backgroundSize: '300% 100%',
                animation: 'shimmerBtn 2.5s linear infinite',
                transform: btnHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1) translateY(0)',
                transition: 'transform 0.2s ease',
                boxShadow: btnHovered ? '0 20px 50px rgba(52,211,153,0.4)' : '0 8px 30px rgba(52,211,153,0.25)',
                display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.3px',
              }}
            >
              Zum Dashboard
              <ArrowRight
                size={18}
                style={{ transform: btnHovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s ease' }}
              />
            </button>
            <p style={{ color: '#1e293b', fontSize: 13 }}>
              API Keys und Einstellungen findest du im Dashboard.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
