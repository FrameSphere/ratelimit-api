/**
 * hq.ts – Client-side helper für die öffentlichen WebControl-HQ Endpoints
 * (kein Auth-Token nötig – das sind die public /api/* Routen)
 */

const HQ_BASE = 'https://webcontrol-hq-api.karol-paschek.workers.dev';
const SITE_ID = 'ratelimit';

// ── Lokaler Token-Store: ticketId → user_token ───────────────────
const STORAGE_KEY = 'rl_support_tokens';

function getTokenMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveToken(ticketId: number, token: string) {
  const map = getTokenMap();
  map[String(ticketId)] = token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getTokenForTicket(ticketId: number): string | null {
  return getTokenMap()[String(ticketId)] || null;
}

export function getSavedTicketIds(): number[] {
  return Object.keys(getTokenMap()).map(Number);
}

// ── API ──────────────────────────────────────────────────────────

export interface HQTicket {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HQMessage {
  id: number;
  sender: 'user' | 'admin';
  message: string;
  created_at: string;
}

/** Neues Ticket einreichen */
export async function submitTicket(params: {
  userId?: string | number;
  name?: string;
  email?: string;
  subject: string;
  message: string;
}): Promise<{ ticket_id: number; user_token: string } | null> {
  try {
    const res = await fetch(`${HQ_BASE}/api/support/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: SITE_ID,
        user_id: params.userId ? String(params.userId) : undefined,
        name:    params.name,
        email:   params.email,
        subject: params.subject,
        message: params.message,
      }),
    });
    const data = await res.json();
    if (data.ticket_id && data.user_token) {
      saveToken(data.ticket_id, data.user_token);
      return { ticket_id: data.ticket_id, user_token: data.user_token };
    }
    return null;
  } catch { return null; }
}

/** Ticket-Thread laden (öffentlich, via user_token) */
export async function getTicketThread(ticketId: number): Promise<{ ticket: HQTicket; messages: HQMessage[] } | null> {
  const token = getTokenForTicket(ticketId);
  if (!token) return null;
  try {
    const res = await fetch(
      `${HQ_BASE}/api/support/${ticketId}/thread?token=${encodeURIComponent(token)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

/** User sendet Follow-up Nachricht */
export async function replyToTicket(ticketId: number, message: string): Promise<boolean> {
  const token = getTokenForTicket(ticketId);
  if (!token) return false;
  try {
    const res = await fetch(`${HQ_BASE}/api/support/${ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, message }),
    });
    return res.ok;
  } catch { return false; }
}

/** Neusten veröffentlichten Changelog-Eintrag laden */
export async function getLatestChangelog(): Promise<any | null> {
  try {
    const res = await fetch(`${HQ_BASE}/api/changelog/published?site_id=${SITE_ID}`);
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch { return null; }
}

/** Alle veröffentlichten Changelog-Einträge */
export async function getAllChangelog(): Promise<any[]> {
  try {
    const res = await fetch(`${HQ_BASE}/api/changelog/published?site_id=${SITE_ID}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
