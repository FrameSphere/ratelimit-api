import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ConfigManagerProps {
  apiKeyId: number;
}

export function ConfigManager({ apiKeyId }: ConfigManagerProps) {
  const [configs, setConfigs] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: number]: any[] }>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilterForm, setShowFilterForm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Config form state
  const [configName, setConfigName] = useState('');
  const [maxRequests, setMaxRequests] = useState('100');
  const [windowSeconds, setWindowSeconds] = useState('3600');

  // Filter form state
  const [ruleType, setRuleType] = useState('ip_blacklist');
  const [ruleValue, setRuleValue] = useState('');
  const [action, setAction] = useState('block');

  useEffect(() => {
    loadConfigs();
  }, [apiKeyId]);

  const loadConfigs = async () => {
    setLoading(true);
    const { data } = await api.getConfigs(apiKeyId);
    if (data?.configs) {
      setConfigs(data.configs);
      // Load filters for each config
      for (const config of data.configs) {
        loadFilters(config.id);
      }
    }
    setLoading(false);
  };

  const loadFilters = async (configId: number) => {
    const { data } = await api.getFilters(configId);
    if (data?.filters) {
      setFilters(prev => ({ ...prev, [configId]: data.filters }));
    }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await api.createConfig(
      apiKeyId,
      configName,
      parseInt(maxRequests),
      parseInt(windowSeconds)
    );

    if (error) {
      alert(error);
      return;
    }

    setConfigName('');
    setMaxRequests('100');
    setWindowSeconds('3600');
    setShowCreateForm(false);
    loadConfigs();
  };

  const handleCreateFilter = async (e: React.FormEvent, configId: number) => {
    e.preventDefault();
    const { error } = await api.createFilter(configId, ruleType, ruleValue, action);

    if (error) {
      alert(error);
      return;
    }

    setRuleValue('');
    setShowFilterForm(null);
    loadFilters(configId);
  };

  const handleToggleConfig = async (config: any) => {
    await api.updateConfig(config.id, {
      name: config.name,
      maxRequests: config.max_requests,
      windowSeconds: config.window_seconds,
      enabled: config.enabled ? 0 : 1,
    });
    loadConfigs();
  };

  const handleDeleteConfig = async (id: number) => {
    if (!confirm('Konfiguration wirklich löschen?')) return;
    await api.deleteConfig(id);
    loadConfigs();
  };

  const handleDeleteFilter = async (id: number, configId: number) => {
    if (!confirm('Filter wirklich löschen?')) return;
    await api.deleteFilter(id);
    loadFilters(configId);
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">RateLimit Konfigurationen</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary btn-sm"
          >
            + Neue Konfiguration
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateConfig} style={{ marginBottom: '1.5rem' }}>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Requests</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxRequests}
                  onChange={(e) => setMaxRequests(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Zeitfenster (Sekunden)</label>
                <input
                  type="number"
                  className="form-input"
                  value={windowSeconds}
                  onChange={(e) => setWindowSeconds(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Erstellen
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary btn-sm"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Lädt...</div>
        ) : (
          <div>
            {configs.map((config) => (
              <div key={config.id} className="card" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{config.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {config.max_requests} Requests pro {config.window_seconds}s
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleToggleConfig(config)}
                      className={`btn btn-sm ${config.enabled ? 'btn-success' : 'btn-secondary'}`}
                    >
                      {config.enabled ? 'Aktiv' : 'Inaktiv'}
                    </button>
                    <button
                      onClick={() => setShowFilterForm(showFilterForm === config.id ? null : config.id)}
                      className="btn btn-sm btn-primary"
                    >
                      + Filter
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(config.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Löschen
                    </button>
                  </div>
                </div>

                {showFilterForm === config.id && (
                  <form onSubmit={(e) => handleCreateFilter(e, config.id)} style={{ marginTop: '1rem' }}>
                    <div className="grid grid-3">
                      <div className="form-group">
                        <label className="form-label">Filter Typ</label>
                        <select
                          className="form-select"
                          value={ruleType}
                          onChange={(e) => setRuleType(e.target.value)}
                        >
                          <option value="ip_blacklist">IP Blacklist</option>
                          <option value="ip_whitelist">IP Whitelist</option>
                          <option value="user_agent">User Agent</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Wert</label>
                        <input
                          type="text"
                          className="form-input"
                          value={ruleValue}
                          onChange={(e) => setRuleValue(e.target.value)}
                          placeholder="z.B. 192.168.1.1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Aktion</label>
                        <select
                          className="form-select"
                          value={action}
                          onChange={(e) => setAction(e.target.value)}
                        >
                          <option value="block">Blockieren</option>
                          <option value="allow">Erlauben</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Filter hinzufügen
                    </button>
                  </form>
                )}

                {filters[config.id] && filters[config.id].length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Aktive Filter:</h4>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Typ</th>
                          <th>Wert</th>
                          <th>Aktion</th>
                          <th>Aktionen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filters[config.id].map((filter) => (
                          <tr key={filter.id}>
                            <td>{filter.rule_type}</td>
                            <td><code>{filter.rule_value}</code></td>
                            <td>
                              <span className={`badge ${filter.action === 'block' ? 'badge-danger' : 'badge-success'}`}>
                                {filter.action}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteFilter(filter.id, config.id)}
                                className="btn btn-sm btn-danger"
                              >
                                Löschen
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
