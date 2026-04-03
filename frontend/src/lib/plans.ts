// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE SOURCE OF TRUTH for all plan limits & feature flags.
//  Import this everywhere — never hardcode plan details in components.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number | null;        // EUR/Monat, null = "auf Anfrage"
  priceLabel: string;
  billingNote: string;
  badge?: string;
  color: string;
  gradient: string;
  limits: {
    apiKeys: number | null;        // null = unbegrenzt
    configsPerKey: number | null;
    filtersPerConfig: number | null;
    requestsPerMonth: number | null;
    analyticsHistory: string;      // "24 Stunden" | "30 Tage" | "90 Tage"
  };
  features: PlanFeature[];
}

export interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '€0',
    billingNote: 'Kostenlos für immer',
    color: '#64748b',
    gradient: 'linear-gradient(135deg,#334155,#475569)',
    limits: {
      apiKeys: 3,
      configsPerKey: 5,
      filtersPerConfig: 10,
      requestsPerMonth: 10_000,
      analyticsHistory: '24 Stunden',
    },
    features: [
      { label: '3 API Keys', included: true },
      { label: '5 Konfigurationen pro Key', included: true },
      { label: '10 Filter-Regeln pro Config', included: true },
      { label: '10.000 Requests / Monat', included: true },
      { label: 'Analytics (24 Stunden)', included: true },
      { label: 'Echtzeit Rate Limiting', included: true },
      { label: 'Log-Export CSV', included: false },
      { label: 'Webhook-Alerts', included: false },
      { label: 'Priority Support', included: false },
    ],
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    priceLabel: '€4,99',
    billingNote: 'pro Monat · jederzeit kündbar',
    badge: 'Beliebt',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    limits: {
      apiKeys: 25,
      configsPerKey: null,
      filtersPerConfig: null,
      requestsPerMonth: 500_000,
      analyticsHistory: '30 Tage',
    },
    features: [
      { label: '25 API Keys', included: true, highlight: true },
      { label: 'Unbegrenzte Konfigurationen', included: true, highlight: true },
      { label: 'Unbegrenzte Filter-Regeln', included: true, highlight: true },
      { label: '500.000 Requests / Monat', included: true, highlight: true },
      { label: 'Analytics (30 Tage)', included: true, highlight: true },
      { label: 'Echtzeit Rate Limiting', included: true },
      { label: 'Log-Export CSV', included: true, highlight: true },
      { label: 'Webhook-Alerts', included: true, highlight: true },
      { label: 'Priority Support', included: true },
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceLabel: 'Auf Anfrage',
    billingNote: 'Individuelles Angebot',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#b45309,#f59e0b)',
    limits: {
      apiKeys: null,
      configsPerKey: null,
      filtersPerConfig: null,
      requestsPerMonth: null,
      analyticsHistory: '90 Tage',
    },
    features: [
      { label: 'Unbegrenzte API Keys', included: true, highlight: true },
      { label: 'Unbegrenzte Konfigurationen', included: true },
      { label: 'Unbegrenzte Filter-Regeln', included: true },
      { label: 'Unbegrenzte Requests', included: true, highlight: true },
      { label: 'Analytics (90 Tage)', included: true, highlight: true },
      { label: 'Log-Export CSV', included: true },
      { label: 'Webhook-Alerts', included: true },
      { label: 'Dedizierter Support + SLA', included: true, highlight: true },
      { label: 'Eigene Domäne / White-Label', included: true, highlight: true },
    ],
  },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getPlan(id: PlanId): PlanDefinition {
  return PLANS[id];
}

/** Human-readable limit for display (e.g. "25" or "∞") */
export function formatLimit(val: number | null): string {
  return val === null ? '∞' : val.toLocaleString('de-DE');
}

/** Format monthly requests nicely */
export function formatRequests(val: number | null): string {
  if (val === null) return 'Unbegrenzt';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
}

/** Check if a user's current plan allows a given resource */
export function canCreate(plan: PlanId, resource: 'apiKey' | 'config' | 'filter', currentCount: number): boolean {
  const limits = PLANS[plan].limits;
  switch (resource) {
    case 'apiKey':
      return limits.apiKeys === null || currentCount < limits.apiKeys;
    case 'config':
      return limits.configsPerKey === null || currentCount < limits.configsPerKey;
    case 'filter':
      return limits.filtersPerConfig === null || currentCount < limits.filtersPerConfig;
  }
}
