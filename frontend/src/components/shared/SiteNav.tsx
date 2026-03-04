interface SiteNavProps { activeHref?: string; }

export function SiteNav({ activeHref }: SiteNavProps) {
  const isLoggedIn = !!localStorage.getItem('token');
  const ls = (href: string): React.CSSProperties => ({
    color: activeHref === href ? 'white' : 'rgba(255,255,255,0.65)',
    textDecoration: 'none', padding: '6px 12px', borderRadius: 7,
    fontSize: '0.875rem', fontWeight: activeHref === href ? 600 : 400,
    transition: 'color .15s',
  });
  const hover = (e: React.MouseEvent<HTMLAnchorElement>, enter: boolean, href: string) =>
    (e.currentTarget.style.color = enter ? 'white' : activeHref === href ? 'white' : 'rgba(255,255,255,0.65)');

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.15rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#snG)" strokeWidth="2">
            <defs><linearGradient id="snG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>RateLimit API</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', flexWrap: 'wrap' }}>
          {[
            ['Features','/#features'],
            ['Guides','/blog/cloudflare-rate-limiting'],
            ['FAQ','/faq'],
            ['Vergleich','/vergleich'],
            ['Changelog','/changelog'],
          ].map(([label, href]) => (
            <a key={href} href={href} style={ls(href)}
               onMouseEnter={e => hover(e, true, href)}
               onMouseLeave={e => hover(e, false, href)}>{label}</a>
          ))}
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }} />
          {isLoggedIn
            ? <a href="/dashboard" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '6px 16px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700 }}>Dashboard →</a>
            : <>
                <a href="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '6px 12px', borderRadius: 7, fontSize: '0.875rem' }}>Anmelden</a>
                <a href="/register" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', textDecoration: 'none', padding: '6px 16px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700 }}>Kostenlos starten</a>
              </>
          }
        </div>
      </div>
    </nav>
  );
}
