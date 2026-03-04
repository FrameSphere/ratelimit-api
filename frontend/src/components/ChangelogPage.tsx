import { useState, useEffect } from 'react';
import { getAllChangelog } from '../lib/hq';

const TYPE_ICON:  Record<string, string> = { feature: '✨', fix: '🐛', improvement: '⚡', security: '🔒', breaking: '💥' };
const TYPE_LABEL: Record<string, string> = { feature: 'Feature', fix: 'Fix', improvement: 'Improvement', security: 'Security', breaking: 'Breaking Change' };
const TYPE_COLOR: Record<string, string> = { feature: '#60a5fa', fix: '#f87171', improvement: '#34d399', security: '#fbbf24', breaking: '#f472b6' };
const TYPE_BG:    Record<string, string> = { feature: 'rgba(96,165,250,0.1)', fix: 'rgba(248,113,113,0.1)', improvement: 'rgba(52,211,153,0.1)', security: 'rgba(251,191,36,0.1)', breaking: 'rgba(244,114,182,0.1)' };

type FilterType = 'all' | 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';

function fmtDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function ChangelogPage() {
  const [entries, setEntries]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterType>('all');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    getAllChangelog().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  // ── styles (inline, matches the dark theme) ──────────────────
  const S = {
    page: {
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    } as React.CSSProperties,

    nav: {
      position: 'sticky' as const, top: 0, zIndex: 100,
      background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 2rem',
    },
    navInner: {
      maxWidth: 900, margin: '0 auto', height: 64,
      display: 'flex', alignItems: 'center', gap: '1rem',
    },
    navLogo: {
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      textDecoration: 'none', color: '#f1f5f9',
      fontWeight: 700, fontSize: '1.05rem',
    },
    logoIcon: {
      width: 30, height: 30, borderRadius: 7,
      background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15,
    },
    navLink: {
      color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
      fontSize: '0.88rem', padding: '6px 12px', borderRadius: 6,
    },
    navBtn: {
      background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
      color: 'white', textDecoration: 'none',
      padding: '6px 16px', borderRadius: 8,
      fontSize: '0.88rem', fontWeight: 600,
    },

    hero: {
      maxWidth: 900, margin: '0 auto',
      padding: '4.5rem 2rem 2.5rem', textAlign: 'center' as const,
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: 50, padding: '4px 14px',
      fontSize: '0.8rem', color: '#93c5fd', marginBottom: '1.25rem', fontWeight: 500,
    },
    h1: {
      fontSize: 'clamp(1.8rem,5vw,2.75rem)', fontWeight: 800,
      letterSpacing: '-0.03em', marginBottom: '0.75rem',
      background: 'linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    } as React.CSSProperties,
    subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' },

    content: { maxWidth: 900, margin: '0 auto', padding: '0 2rem 5rem' },

    filterBar: {
      display: 'flex', gap: 6, flexWrap: 'wrap' as const,
      padding: '0.875rem 1.125rem',
      background: 'rgba(30,41,59,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, marginBottom: '2rem',
      alignItems: 'center',
    },
    filterLabel: { color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginRight: 2 },

    timeline: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },

    footer: {
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '2rem', textAlign: 'center' as const,
      color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem',
    },
  };

  const filterBtn = (type: FilterType, label: string) => {
    const active = filter === type;
    return (
      <button
        key={type}
        onClick={() => setFilter(type)}
        style={{
          padding: '4px 13px', borderRadius: 6, border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
          background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
          color: active ? '#93c5fd' : 'rgba(255,255,255,0.5)',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all .12s',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={S.page}>

      {/* ── Nav ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <a href="/" style={S.navLogo}>
            <div style={S.logoIcon}>⚡</div>
            RateLimit API
          </a>
          <div style={{ flex: 1 }} />
          <a href="/" style={S.navLink}>Home</a>
          {isLoggedIn
            ? <a href="/dashboard" style={S.navBtn}>Dashboard</a>
            : <a href="/register" style={S.navBtn}>Kostenlos starten</a>
          }
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.badge}>📋 Release Notes</div>
        <h1 style={S.h1}>Changelog</h1>
        <p style={S.subtitle}>
          Alle Änderungen, neuen Features und Bugfixes chronologisch dokumentiert.
        </p>
      </div>

      {/* ── Content ── */}
      <div style={S.content}>

        {/* Filter bar */}
        <div style={S.filterBar}>
          <span style={S.filterLabel}>Filter:</span>
          {filterBtn('all',         'Alle')}
          {filterBtn('feature',     '✨ Features')}
          {filterBtn('fix',         '🐛 Fixes')}
          {filterBtn('improvement', '⚡ Verbesserungen')}
          {filterBtn('security',    '🔒 Security')}
          {filterBtn('breaking',    '💥 Breaking')}
        </div>

        {/* States */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(59,130,246,0.2)',
              borderTopColor: '#3b82f6',
              animation: 'spin .8s linear infinite',
              margin: '0 auto 1rem',
            }} />
            Changelog wird geladen…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              {entries.length === 0 ? '📭' : '🔍'}
            </div>
            {entries.length === 0
              ? 'Noch keine Changelog-Einträge vorhanden.'
              : 'Keine Einträge für diesen Filter.'
            }
          </div>
        )}

        {/* Timeline */}
        {!loading && filtered.length > 0 && (
          <div style={S.timeline}>
            {filtered.map((e, i) => (
              <div
                key={e.id}
                style={{
                  background: `linear-gradient(135deg,${TYPE_BG[e.type] || 'rgba(59,130,246,0.06)'} 0%,rgba(15,23,42,0.3) 100%)`,
                  border: `1px solid ${TYPE_COLOR[e.type] || '#60a5fa'}25`,
                  borderRadius: 14, padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  animation: `fadeUp .25s ease ${i * 35}ms both`,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: 10,
                  background: TYPE_BG[e.type] || 'rgba(59,130,246,0.1)',
                  border: `1px solid ${TYPE_COLOR[e.type] || '#60a5fa'}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginTop: 1,
                }}>
                  {TYPE_ICON[e.type] || '📋'}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700,
                      color: TYPE_COLOR[e.type] || '#60a5fa',
                      background: TYPE_BG[e.type] || 'rgba(59,130,246,0.1)',
                      padding: '2px 8px', borderRadius: 4,
                    }}>
                      {e.version}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
                      {e.title}
                    </span>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {TYPE_LABEL[e.type] || e.type}
                    </span>
                  </div>
                  {e.description && (
                    <div style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                      {e.description}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 6, fontFamily: 'monospace' }}>
                    {fmtDate(e.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {[['Home','/'],['Dashboard','/dashboard'],['Impressum','/impressum'],['Datenschutz','/datenschutz']].map(([l,h]) => (
            <a key={h} href={h} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        © 2026 RateLimit API
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
