// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE SOURCE OF TRUTH for all plan limits & feature flags.
//  Import this everywhere — never hardcode plan details in components.
// ─────────────────────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number | null;
  priceLabel: string;
  billingNote: string;
  badge?: string;
  color: string;
  gradient: string;
  limits: {
    apiKeys: number | null;
    configsPerKey: number | null;
    filtersPerConfig: number | null;
    requestsPerMonth: number | null;
    analyticsHistory: string;
    alertsPerKey: number | null;
  };
  features: PlanFeature[];
  proFeatures?: ProFeatureFlag[];
}

export interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
}

export interface ProFeatureFlag {
  id: string;
  label: string;
  description: string;
}

// ─── Features that are Pro-gated in the UI ───────────────────────────────────

export const PRO_FEATURES: ProFeatureFlag[] = [
  {
    id: 'alerts',
    label: 'Webhook-Alerts',
    description: 'Erhalte sofortige Benachrichtigungen bei Spikes, DDoS-Mustern und wenn Limits fast erreicht sind — per Slack, Discord oder Custom Webhook.',
  },
  {
    id: 'csv_export',
    label: 'Log-Export (CSV)',
    description: 'Exportiere alle Request-Logs als CSV für externe Analyse oder Compliance.',
  },
  {
    id: 'extended_analytics',
    label: '30-Tage Analytics',
    description: 'Analytics-Verlauf für die letzten 30 Tage statt nur 24 Stunden.',
  },
  {
    id: 'anomaly_detection',
    label: 'Anomalie-Erkennung',
    description: 'Automatische Erkennung von ungewöhnlichem Traffic, Bots und Scraping-Versuchen.',
  },
  {
    id: 'sandbox',
    label: 'Test-Modus / Sandbox',
    description: 'Simuliere Requests gegen deine Konfiguration — ohne echten Traffic zu riskieren.',
  },
  {
    id: 'near_limit',
    label: 'Near-Limit Visualisierung',
    description: 'Sieh auf einen Blick, welche Keys bei 80%, 90%, 95% ihrer Limits sind.',
  },
  {
    id: 'retry_insights',
    label: 'Retry / Backoff Insights',
    description: 'Erkenne Clients die aggressiv retryen und verbessere ihre Backoff-Implementierung.',
  },
];

export function isProFeature(featureId: string): boolean {
  return PRO_FEATURES.some(f => f.id === featureId);
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
      alertsPerKey: 0,
    },
    features: [
      { label: '3 API Keys', included: true },
      { label: '5 Konfigurationen pro Key', included: true },
      { label: '10 Filter-Regeln pro Config', included: true },
      { label: '10.000 Requests / Monat', included: true },
      { label: 'Analytics (24 Stunden)', included: true },
      { label: 'Echtzeit Rate Limiting', included: true },
      { label: 'Log-Export CSV', included: false },
      { label: 'Webhook-Alerts (Slack, Discord)', included: false },
      { label: 'Anomalie-Erkennung', included: false },
      { label: 'Test-Modus / Sandbox', included: false },
      { label: 'Near-Limit Visualisierung', included: false },
      { label: 'Retry/Backoff Insights', included: false },
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
      alertsPerKey: 5,
    },
    features: [
      { label: '25 API Keys', included: true, highlight: true },
      { label: 'Unbegrenzte Konfigurationen', included: true, highlight: true },
      { label: 'Unbegrenzte Filter-Regeln', included: true, highlight: true },
      { label: '500.000 Requests / Monat', included: true, highlight: true },
      { label: 'Analytics (30 Tage)', included: true, highlight: true },
      { label: 'Echtzeit Rate Limiting', included: true },
      { label: 'Log-Export CSV', included: true, highlight: true },
      { label: 'Webhook-Alerts (Slack, Discord)', included: true, highlight: true },
      { label: 'Anomalie-Erkennung', included: true, highlight: true },
      { label: 'Test-Modus / Sandbox', included: true, highlight: true },
      { label: 'Near-Limit Visualisierung', included: true, highlight: true },
      { label: 'Retry/Backoff Insights', included: true },
      { label: 'Priority Support', included: true },
    ],
    proFeatures: PRO_FEATURES,
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
      alertsPerKey: null,
    },
    features: [
      { label: 'Unbegrenzte API Keys', included: true, highlight: true },
      { label: 'Unbegrenzte Konfigurationen', included: true },
      { label: 'Unbegrenzte Filter-Regeln', included: true },
      { label: 'Unbegrenzte Requests', included: true, highlight: true },
      { label: 'Analytics (90 Tage)', included: true, highlight: true },
      { label: 'Log-Export CSV', included: true },
      { label: 'Webhook-Alerts (unbegrenzt)', included: true, highlight: true },
      { label: 'Anomalie-Erkennung + Custom Rules', included: true, highlight: true },
      { label: 'Test-Modus / Sandbox', included: true },
      { label: 'Near-Limit Visualisierung', included: true },
      { label: 'Dedizierter Support + SLA', included: true, highlight: true },
      { label: 'Eigene Domäne / White-Label', included: true, highlight: true },
      { label: 'Adaptive Rate Limiting', included: true, highlight: true },
    ],
    proFeatures: PRO_FEATURES,
  },
};

export function getPlan(id: PlanId): PlanDefinition {
  return PLANS[id];
}

export function formatLimit(val: number | null): string {
  return val === null ? '∞' : val.toLocaleString('de-DE');
}

export function formatRequests(val: number | null): string {
  if (val === null) return 'Unbegrenzt';
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return val.toString();
}

export function canCreate(plan: PlanId, resource: 'apiKey' | 'config' | 'filter', currentCount: number): boolean {
  const limits = PLANS[plan].limits;
  switch (resource) {
    case 'apiKey':   return limits.apiKeys === null || currentCount < limits.apiKeys;
    case 'config':   return limits.configsPerKey === null || currentCount < limits.configsPerKey;
    case 'filter':   return limits.filtersPerConfig === null || currentCount < limits.filtersPerConfig;
  }
}

export function canUseProFeature(plan: PlanId, featureId: string): boolean {
  if (plan === 'pro' || plan === 'enterprise') return true;
  return false;
}
