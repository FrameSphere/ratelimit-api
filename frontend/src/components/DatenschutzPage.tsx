import { SiteNav } from './shared/SiteNav';
import { SiteFooter } from './shared/SiteFooter';

export function DatenschutzPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Datenschutzerklärung</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '3rem' }}>Privacy Policy</p>

        {/* 1 */}
        <Section title="1. Überblick">
          <P>
            Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten wir bei der Nutzung
            von <strong>RateLimit API</strong> (ratelimit-api.pages.dev) erheben, wie wir sie verwenden und welche
            Rechte Sie haben.
          </P>
        </Section>

        {/* 2 */}
        <Section title="2. Verantwortlicher">
          <P>
            Karol Paschek / FrameSphere<br />
            Universitätsstraße 8, 55270 Zornheim, Deutschland<br />
            E-Mail: <a href="mailto:kpaschek@gmx.de" style={link}>kpaschek@gmx.de</a>
          </P>
        </Section>

        {/* 3 */}
        <Section title="3. Erhobene Daten & Verarbeitungszwecke">
          <SubTitle>3.1 Registrierung & Login (E-Mail / Passwort)</SubTitle>
          <P>
            Bei der manuellen Registrierung erfassen wir Ihre E-Mail-Adresse und ein gehashtes Passwort (bcrypt).
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </P>

          <SubTitle>3.2 OAuth-Login über Google</SubTitle>
          <P>
            Sie können sich über Ihr Google-Konto anmelden. Dabei übermittelt Google uns folgende Daten:
          </P>
          <ul style={ul}>
            <li style={li}>E-Mail-Adresse</li>
            <li style={li}>Anzeigename (Name)</li>
            <li style={li}>Profilbild-URL (optional)</li>
            <li style={li}>Interne Google-Nutzer-ID</li>
          </ul>
          <P>
            Diese Daten werden ausschließlich zur Erstellung und Verwaltung Ihres RateLimit-API-Kontos verwendet.
            Wir speichern weder Ihr Google-Passwort noch erhalten wir Zugriff auf Ihre Google-Daten außerhalb des
            Anmeldevorgangs. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </P>
          <P>
            Durch die Nutzung des Google-Logins gelten zusätzlich die{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>
              Datenschutzbestimmungen von Google
            </a>.
          </P>

          <SubTitle>3.3 OAuth-Login über GitHub</SubTitle>
          <P>
            Analog zu Google übermittelt GitHub uns E-Mail-Adresse, Nutzernamen und Nutzer-ID. Weitere Daten
            werden nicht erhoben. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
          </P>

          <SubTitle>3.4 API-Nutzung & Logs</SubTitle>
          <P>
            Bei der Nutzung der API werden Anfrage-Metadaten (Zeitstempel, API-Key-Hash, Statuscode) zur
            Ratelimiting-Logik und Fehleranalyse gespeichert. Es werden keine Anfrage-Inhalte (Payloads) persistiert.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Betriebssicherheit).
          </P>

          <SubTitle>3.5 Zahlungsdaten (Stripe)</SubTitle>
          <P>
            Zahlungen werden vollständig über Stripe verarbeitet. Wir erhalten nur anonymisierte Bestätigungen
            (Customer-ID, Plan-Typ). Kreditkartendaten werden ausschließlich von Stripe gespeichert. Weitere
            Informationen:{' '}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>
              stripe.com/privacy
            </a>.
          </P>
        </Section>

        {/* 4 */}
        <Section title="4. Hosting & Infrastruktur">
          <P>
            Die Anwendung läuft auf <strong>Cloudflare Workers & Pages</strong> (Cloudflare, Inc., 101 Townsend St.,
            San Francisco, CA 94107, USA). Cloudflare verarbeitet Verbindungsdaten (IP-Adresse, Timestamps) im Rahmen
            des Betriebs. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert.
          </P>
          <P>
            Datenbank: Cloudflare D1 (SQLite, läuft in Cloudflare-Rechenzentren in der EU/USA).
          </P>
        </Section>

        {/* 5 */}
        <Section title="5. Datenweitergabe an Dritte">
          <P>
            Wir geben Ihre Daten nur in folgenden Fällen weiter:
          </P>
          <ul style={ul}>
            <li style={li}>An Cloudflare als Hosting-Anbieter (technisch notwendig)</li>
            <li style={li}>An Stripe für die Zahlungsabwicklung</li>
            <li style={li}>An Google / GitHub, soweit Sie OAuth-Login nutzen</li>
            <li style={li}>Bei gesetzlicher Verpflichtung</li>
          </ul>
          <P>Eine Weitergabe zu Werbezwecken erfolgt nicht.</P>
        </Section>

        {/* 6 */}
        <Section title="6. Speicherdauer">
          <P>
            Kontodaten werden gespeichert, solange das Konto aktiv ist. Nach Kontolöschung werden alle
            personenbezogenen Daten innerhalb von 30 Tagen gelöscht. API-Logs werden nach 90 Tagen automatisch
            gelöscht.
          </P>
        </Section>

        {/* 7 */}
        <Section title="7. Ihre Rechte (DSGVO)">
          <P>Sie haben das Recht auf:</P>
          <ul style={ul}>
            <li style={li}><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15)</li>
            <li style={li}><strong>Berichtigung</strong> unrichtiger Daten (Art. 16)</li>
            <li style={li}><strong>Löschung</strong> Ihrer Daten (Art. 17)</li>
            <li style={li}><strong>Einschränkung</strong> der Verarbeitung (Art. 18)</li>
            <li style={li}><strong>Datenübertragbarkeit</strong> (Art. 20)</li>
            <li style={li}><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21)</li>
          </ul>
          <P>
            Zur Ausübung Ihrer Rechte wenden Sie sich an:{' '}
            <a href="mailto:kpaschek@gmx.de" style={link}>kpaschek@gmx.de</a>
          </P>
          <P>
            Sie haben außerdem das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen
            (Landesbeauftragter für den Datenschutz Rheinland-Pfalz).
          </P>
        </Section>

        {/* 8 */}
        <Section title="8. SSL-Verschlüsselung">
          <P>
            Diese Website nutzt ausschließlich HTTPS. Alle Datenübertragungen sind mit TLS verschlüsselt.
          </P>
        </Section>

        {/* 9 */}
        <Section title="9. Cookies & lokale Speicherung">
          <P>
            Wir verwenden ausschließlich technisch notwendige Speicherung (localStorage für JWT-Token zur
            Sitzungsverwaltung). Es werden keine Tracking- oder Werbe-Cookies gesetzt.
          </P>
        </Section>

        {/* 10 */}
        <Section title="10. Änderungen">
          <P>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen. Die aktuelle Version ist stets unter
            /datenschutz abrufbar. Bei wesentlichen Änderungen informieren wir registrierte Nutzer per E-Mail.
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
        fontSize: '1rem',
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem', marginTop: '1.2rem' }}>
      {children}
    </p>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '0.75rem' }}>{children}</p>;
}

const ul: React.CSSProperties = {
  paddingLeft: '1.5rem',
  marginBottom: '0.75rem',
};

const li: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  lineHeight: 1.75,
  marginBottom: '0.25rem',
};

const link: React.CSSProperties = {
  color: '#6366f1',
  textDecoration: 'none',
};
