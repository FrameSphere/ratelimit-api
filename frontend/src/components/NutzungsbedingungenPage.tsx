import { Link } from 'react-router-dom';
import { SiteNav } from './shared/SiteNav';
import { SiteFooter } from './shared/SiteFooter';

export function NutzungsbedingungenPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Nutzungsbedingungen</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '3rem' }}>Terms of Service · Stand: April 2026</p>

        <Section title="1. Geltungsbereich">
          <P>
            Diese Nutzungsbedingungen gelten für die Nutzung von <strong>RateLimit API</strong>, betrieben von
            Karol Paschek / FrameSphere, Universitätsstraße 8, 55270 Zornheim, Deutschland
            (nachfolgend „Anbieter").
          </P>
          <P>
            Mit der Registrierung oder Nutzung des Dienstes erklären Sie sich mit diesen Bedingungen einverstanden.
          </P>
        </Section>

        <Section title="2. Leistungsbeschreibung">
          <P>
            RateLimit API ist ein cloudbasierter Dienst zur Verwaltung von API-Rate-Limits. Der Dienst umfasst:
          </P>
          <ul style={ul}>
            <li style={li}>API-Key-Verwaltung</li>
            <li style={li}>Rate-Limiting-Logik (Token Bucket, Sliding Window, Fixed Window)</li>
            <li style={li}>Nutzungsanalysen und Dashboards</li>
            <li style={li}>Optionale kostenpflichtige Erweiterungen (Pro-Plan)</li>
          </ul>
        </Section>

        <Section title="3. Registrierung & Account">
          <P>
            Zur Nutzung ist ein Konto erforderlich. Sie können sich per E-Mail/Passwort oder über OAuth-Anbieter
            (Google, GitHub) registrieren. Sie sind verpflichtet, korrekte Angaben zu machen und Ihre
            Zugangsdaten vertraulich zu behandeln.
          </P>
          <P>
            Der Anbieter behält sich vor, Konten bei Verstoß gegen diese Bedingungen zu sperren oder zu löschen.
          </P>
        </Section>

        <Section title="4. Nutzungspflichten & verbotene Nutzung">
          <P>Sie verpflichten sich, den Dienst nicht zu nutzen für:</P>
          <ul style={ul}>
            <li style={li}>Rechtswidrige Aktivitäten jeglicher Art</li>
            <li style={li}>Überlastung oder gezielte Störung der Infrastruktur (DoS/DDoS)</li>
            <li style={li}>Reverse Engineering oder unautorisierter Zugriff auf Systemkomponenten</li>
            <li style={li}>Weitergabe von API-Keys an unbefugte Dritte</li>
            <li style={li}>Umgehung von Rate-Limits oder Sicherheitsmechanismen</li>
          </ul>
        </Section>

        <Section title="5. Free Plan & kostenpflichtige Pläne">
          <P>
            Der Free-Plan steht kostenlos zur Verfügung und kann jederzeit ohne Begründung eingestellt werden.
            Kostenpflichtige Pläne werden über Stripe abgerechnet. Preise und Leistungsumfang sind auf der{' '}
            <Link to="/pricing" style={link}>Pricing-Seite</Link> einsehbar.
          </P>
          <P>
            Für Verbraucher gilt ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss, sofern der
            Dienst noch nicht vollständig in Anspruch genommen wurde.
          </P>
        </Section>

        <Section title="6. Verfügbarkeit & SLA">
          <P>
            Der Anbieter strebt eine hohe Verfügbarkeit an, übernimmt jedoch keine Garantie für eine ununterbrochene
            Verfügbarkeit. Wartungsarbeiten werden nach Möglichkeit angekündigt. Es besteht kein Anspruch auf
            Schadensersatz bei Ausfällen.
          </P>
        </Section>

        <Section title="7. Haftungsbeschränkung">
          <P>
            Der Anbieter haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen.
            Für leichte Fahrlässigkeit wird die Haftung auf vorhersehbare, vertragstypische Schäden begrenzt.
            Für indirekte Schäden, entgangenen Gewinn oder Datenverlust wird keine Haftung übernommen.
          </P>
        </Section>

        <Section title="8. Geistiges Eigentum">
          <P>
            Alle Rechte an der Plattform, dem Code und den Inhalten liegen beim Anbieter. Die Nutzung des
            Dienstes gewährt kein Eigentum an diesen Inhalten. Eigene Daten und API-Keys der Nutzer verbleiben
            im Eigentum des jeweiligen Nutzers.
          </P>
        </Section>

        <Section title="9. Datenschutz">
          <P>
            Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{' '}
            <Link to="/datenschutz" style={link}>Datenschutzerklärung</Link>.
          </P>
        </Section>

        <Section title="10. Änderungen der Nutzungsbedingungen">
          <P>
            Der Anbieter behält sich vor, diese Bedingungen anzupassen. Registrierte Nutzer werden bei
            wesentlichen Änderungen per E-Mail informiert. Die weitere Nutzung nach Inkrafttreten der
            Änderungen gilt als Zustimmung.
          </P>
        </Section>

        <Section title="11. Kündigung">
          <P>
            Sie können Ihr Konto jederzeit über das Dashboard löschen. Der Anbieter kann Konten bei
            schwerwiegenden Verstößen gegen diese Bedingungen fristlos kündigen.
          </P>
        </Section>

        <Section title="12. Anwendbares Recht & Gerichtsstand">
          <P>
            Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit gesetzlich
            zulässig, Mainz, Deutschland.
          </P>
        </Section>

        <Section title="13. Kontakt">
          <P>
            Bei Fragen zu diesen Nutzungsbedingungen:{' '}
            <a href="mailto:kpaschek@gmx.de" style={link}>kpaschek@gmx.de</a>
          </P>
        </Section>

        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', marginTop: '3rem' }}>Stand: April 2026</p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#94a3b8',
        marginBottom: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '0.75rem' }}>{children}</p>;
}

const ul: React.CSSProperties = { paddingLeft: '1.5rem', marginBottom: '0.75rem' };
const li: React.CSSProperties = { color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '0.25rem' };
const link: React.CSSProperties = { color: '#6366f1', textDecoration: 'none' };
