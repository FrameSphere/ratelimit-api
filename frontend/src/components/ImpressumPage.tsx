import { SiteNav } from './shared/SiteNav';
import { SiteFooter } from './shared/SiteFooter';

export function ImpressumPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Impressum</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '3rem' }}>Angaben gemäß § 5 TMG</p>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2}>Anbieter</h2>
          <p style={p}>
            Karol Paschek / FrameSphere<br />
            Universitätsstraße 8<br />
            55270 Zornheim<br />
            Deutschland
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2}>Kontakt</h2>
          <p style={p}>
            E-Mail:{' '}
            <a href="mailto:kpaschek@gmx.de" style={link}>kpaschek@gmx.de</a>
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p style={p}>
            Karol Paschek<br />
            Universitätsstraße 8<br />
            55270 Zornheim
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2}>Streitschlichtung</h2>
          <p style={p}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={link}>
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p style={p}>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={h2}>Haftung für Inhalte</h2>
          <p style={p}>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
            forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
        </section>

        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', marginTop: '3rem' }}>Stand: April 2026</p>
      </main>
      <SiteFooter />
    </div>
  );
}

const h2: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const p: React.CSSProperties = {
  color: 'rgba(255,255,255,0.65)',
  lineHeight: 1.7,
  marginBottom: '0.75rem',
};

const link: React.CSSProperties = {
  color: '#6366f1',
  textDecoration: 'none',
};
