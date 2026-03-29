export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', background: '#0f172a' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[
            ['Home','/'],['Features','/#features'],['Changelog','/changelog'],
            ['FAQ','/faq'],['Vergleich','/vergleich'],
            ['Guide: Cloudflare','/blog/cloudflare-rate-limiting'],
            ['Guide: Algorithmen','/blog/rate-limiting-algorithms'],
            ['Guide: Use Cases','/blog/api-use-cases'],
            ['Impressum','/impressum'],['Datenschutz','/datenschutz'],
          ].map(([l,h]) => (
            <a key={h} href={h} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
               onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
               onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              {l}
            </a>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>
          © 2026 RateLimit API · powered by{' '}
          <a
            href="https://frame-sphere.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          >
            FrameSphere
          </a>
        </div>
      </div>
    </footer>
  );
}
