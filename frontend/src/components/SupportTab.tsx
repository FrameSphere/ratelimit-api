import { useState, useEffect, useRef } from 'react';
import {
  submitTicket,
  getTicketThread,
  replyToTicket,
  getSavedTicketIds,
  type HQTicket,
  type HQMessage,
} from '../lib/hq';

interface SupportTabProps {
  user: { id: number; name: string; email: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  open:        'Offen',
  in_progress: 'In Bearbeitung',
  resolved:    'Gelöst',
  closed:      'Geschlossen',
};

const STATUS_COLOR: Record<string, string> = {
  open:        '#60a5fa',
  in_progress: '#fbbf24',
  resolved:    '#34d399',
  closed:      '#9ca3af',
};

const STATUS_BG: Record<string, string> = {
  open:        'rgba(96,165,250,0.12)',
  in_progress: 'rgba(251,191,36,0.12)',
  resolved:    'rgba(52,211,153,0.12)',
  closed:      'rgba(156,163,175,0.08)',
};

// ── helpers ──────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: 4,
      background: STATUS_BG[status] || 'rgba(255,255,255,0.06)',
      color: STATUS_COLOR[status] || '#e2e8f0',
      border: `1px solid ${STATUS_COLOR[status] || '#475569'}30`,
    }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────
export function SupportTab({ user }: SupportTabProps) {
  const [view, setView] = useState<'list' | 'new' | 'chat'>('list');
  const [ticketIds, setTicketIds] = useState<number[]>([]);
  const [threads, setThreads] = useState<Record<number, { ticket: HQTicket; messages: HQMessage[] }>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // New ticket form
  const [form, setForm] = useState({ subject: '', message: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Chat reply
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load all known ticket IDs from localStorage on mount
  useEffect(() => {
    const ids = getSavedTicketIds();
    setTicketIds(ids);
    ids.forEach(id => loadThread(id));
  }, []);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, threads]);

  async function loadThread(id: number, forceRefresh = false) {
    if (loadingIds.has(id) && !forceRefresh) return;
    setLoadingIds(prev => new Set(prev).add(id));
    const thread = await getTicketThread(id);
    setLoadingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    if (thread) {
      setThreads(prev => ({ ...prev, [id]: thread }));
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all(ticketIds.map(id => loadThread(id, true)));
    if (activeId) await loadThread(activeId, true);
    setRefreshing(false);
  }

  async function handleSubmit() {
    if (!form.subject.trim()) { setFormError('Betreff ist erforderlich.'); return; }
    if (form.message.trim().length < 10) { setFormError('Nachricht ist zu kurz (min. 10 Zeichen).'); return; }
    setFormError('');
    setSubmitting(true);
    const result = await submitTicket({
      userId:  user?.id,
      name:    user?.name,
      email:   user?.email,
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (result) {
      setSubmitted(true);
      setTicketIds(prev => [result.ticket_id, ...prev.filter(x => x !== result.ticket_id)]);
      await loadThread(result.ticket_id, true);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ subject: '', message: '' });
        setView('chat');
        setActiveId(result.ticket_id);
      }, 1500);
    } else {
      setFormError('Fehler beim Senden. Bitte versuche es erneut.');
    }
  }

  async function handleSendReply() {
    if (!activeId || !reply.trim()) return;
    setSending(true);
    const ok = await replyToTicket(activeId, reply.trim());
    if (ok) {
      setReply('');
      await loadThread(activeId, true);
    }
    setSending(false);
  }

  // ── Views ────────────────────────────────────────────────────

  // Ticket list
  const ticketList = ticketIds
    .map(id => threads[id])
    .filter(Boolean)
    .sort((a, b) => new Date(b.ticket.updated_at || b.ticket.created_at).getTime()
      - new Date(a.ticket.updated_at || a.ticket.created_at).getTime());

  const activeThread = activeId ? threads[activeId] : null;

  // ── Render ───────────────────────────────────────────────────
  const S: Record<string, React.CSSProperties> = {
    container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

    topBar: {
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)',
      marginBottom: '0.5rem',
    },
    topTitle: { fontWeight: 700, fontSize: '1rem', flex: 1 },

    // Shared card
    card: {
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      overflow: 'hidden',
    },

    // Sidebar + chat split
    split: {
      display: 'flex',
      height: 560,
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      overflow: 'hidden',
    },
    sidebar: {
      width: 280, flexShrink: 0,
      overflowY: 'auto' as const,
      borderRight: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
    },
    chatArea: {
      flex: 1, display: 'flex', flexDirection: 'column' as const,
      background: 'var(--bg-color)', minWidth: 0,
    },
  };

  return (
    <div style={S.container}>
      {/* ── Top bar ── */}
      <div style={S.topBar}>
        <span style={S.topTitle}>
          🎫 Support
          {ticketList.filter(t => t.ticket.status === 'open').length > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 7px',
              borderRadius: 4, background: 'rgba(96,165,250,.15)', color: '#60a5fa',
            }}>
              {ticketList.filter(t => t.ticket.status === 'open').length} offen
            </span>
          )}
        </span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '…' : '↻ Aktualisieren'}
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setView('new')}
        >
          + Neues Ticket
        </button>
      </div>

      {/* ── New Ticket Form ── */}
      {view === 'new' && (
        <div style={{ ...S.card, padding: '1.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
            📝 Neues Support-Ticket
          </div>

          {submitted ? (
            <div style={{
              textAlign: 'center', padding: '2rem',
              color: 'var(--success-color)', fontWeight: 600,
            }}>
              ✓ Ticket wurde erfolgreich eingereicht!
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Betreff</label>
                <input
                  className="form-input"
                  placeholder="Kurze Beschreibung des Problems…"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nachricht</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Beschreibe dein Problem oder deine Frage so genau wie möglich…"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Wird gesendet…' : '✈ Ticket einreichen'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setView('list'); setFormError(''); }}
                >
                  Abbrechen
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Ticket List + Chat ── */}
      {view !== 'new' && (
        <div style={S.split}>
          {/* Sidebar */}
          <div style={S.sidebar}>
            {ticketList.length === 0 ? (
              <div style={{
                padding: '3rem 1.25rem', textAlign: 'center',
                color: 'var(--text-secondary)', fontSize: '0.88rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                Noch keine Tickets.<br />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setView('new')}
                >
                  Erstes Ticket erstellen
                </button>
              </div>
            ) : ticketList.map(({ ticket }) => (
              <div
                key={ticket.id}
                onClick={() => { setActiveId(ticket.id); setView('chat'); loadThread(ticket.id); }}
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  background: activeId === ticket.id ? 'rgba(59,130,246,0.07)' : 'transparent',
                  borderLeft: activeId === ticket.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  transition: 'background .12s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <StatusBadge status={ticket.status} />
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    #{ticket.id}
                  </span>
                </div>
                <div style={{
                  fontWeight: 600, fontSize: '0.85rem',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}>
                  {ticket.subject}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {fmtDate(ticket.updated_at || ticket.created_at)}
                </div>
              </div>
            ))}
          </div>

          {/* Chat area */}
          <div style={S.chatArea}>
            {!activeThread ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📬</div>
                  <div style={{ fontSize: '0.9rem' }}>Ticket auswählen um die Konversation zu sehen</div>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)', flexShrink: 0,
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>
                      {activeThread.ticket.subject}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <StatusBadge status={activeThread.ticket.status} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        #{activeThread.ticket.id}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Erstellt: {fmtDate(activeThread.ticket.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => loadThread(activeId!, true)}
                    disabled={loadingIds.has(activeId!)}
                    title="Aktualisieren"
                  >
                    ↻
                  </button>
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: 'auto',
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {activeThread.messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem' }}>
                      Noch keine Nachrichten
                    </div>
                  ) : activeThread.messages.map(m => (
                    <ChatBubble key={m.id} message={m} />
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Reply box — only if not closed/resolved */}
                {['open', 'in_progress'].includes(activeThread.ticket.status) ? (
                  <div style={{
                    padding: '12px 16px', borderTop: '1px solid var(--border-color)',
                    flexShrink: 0, background: 'var(--bg-secondary)',
                  }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <textarea
                        rows={2}
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
                        }}
                        placeholder="Nachricht schreiben… (Strg+Enter zum Senden)"
                        style={{
                          flex: 1, resize: 'none', padding: '8px 12px',
                          fontSize: '0.85rem', borderRadius: 8,
                          background: 'var(--bg-color)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)', outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ alignSelf: 'flex-end', padding: '8px 16px' }}
                        onClick={handleSendReply}
                        disabled={sending || !reply.trim()}
                      >
                        {sending ? '…' : '➤ Senden'}
                      </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      Unser Team antwortet in der Regel innerhalb von 24 Stunden.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px 16px', borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)', flexShrink: 0,
                    textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)',
                  }}>
                    Dieses Ticket ist{' '}
                    <strong style={{ color: STATUS_COLOR[activeThread.ticket.status] }}>
                      {STATUS_LABEL[activeThread.ticket.status]}
                    </strong>
                    {' '}— keine weiteren Antworten möglich.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat bubble sub-component ─────────────────────────────────────
function ChatBubble({ message }: { message: HQMessage }) {
  const isAdmin = message.sender === 'admin';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isAdmin ? 'flex-start' : 'flex-end',
    }}>
      <div style={{
        maxWidth: '78%', padding: '8px 13px',
        borderRadius: isAdmin ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isAdmin
          ? 'var(--bg-secondary)'
          : 'linear-gradient(135deg, #3b82f6, #6366f1)',
        color: isAdmin ? 'var(--text-primary)' : '#fff',
        fontSize: '0.85rem', lineHeight: 1.55,
        border: isAdmin ? '1px solid var(--border-color)' : 'none',
        wordBreak: 'break-word',
      }}>
        {message.message.split('\n').map((line, i) => (
          <span key={i}>{line}{i < message.message.split('\n').length - 1 && <br />}</span>
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 3, padding: '0 4px' }}>
        {isAdmin ? '🔧 Support-Team' : '👤 Du'} · {fmtDate(message.created_at)}
      </div>
    </div>
  );
}
