import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ApiKeyManagerProps {
  onSelectApiKey: (id: number) => void;
}

export function ApiKeyManager({ onSelectApiKey }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    const { data } = await api.getApiKeys();
    if (data?.apiKeys) {
      setApiKeys(data.apiKeys);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await api.createApiKey(keyName);
    
    if (error) {
      alert(error);
      return;
    }

    if (data?.apiKey) {
      setNewKey(data.apiKey.api_key);
      setKeyName('');
      setShowCreateForm(false);
      loadApiKeys();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('API Key wirklich löschen?')) return;
    
    await api.deleteApiKey(id);
    loadApiKeys();
  };

  const handleCopyKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      alert('API Key kopiert!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('API Key kopiert!');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">API Keys</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary btn-sm"
          >
            + Neuer API Key
          </button>
        </div>

        {newKey && (
          <div className="alert alert-success">
            <strong>API Key erstellt!</strong>
            <div style={{ 
              marginTop: '0.5rem', 
              fontFamily: 'monospace', 
              fontSize: '0.9rem',
              wordBreak: 'break-all',
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '4px'
            }}>
              {newKey}
            </div>
            <small style={{ display: 'block', marginTop: '0.5rem' }}>
              ⚠️ Bitte speichern Sie diesen Key, er wird nur einmal angezeigt!
            </small>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => handleCopyKey(newKey)}
                className="btn btn-sm btn-primary"
              >
                📋 Kopieren
              </button>
              <button
                onClick={() => setNewKey(null)}
                className="btn btn-sm btn-secondary"
              >
                Verstanden
              </button>
            </div>
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Key Name</label>
              <input
                type="text"
                className="form-input"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="z.B. Production API"
                required
              />
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
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>API Key</th>
                <th>Status</th>
                <th>Erstellt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td>{key.key_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code style={{ fontSize: '0.85rem' }}>
                        {key.api_key.substring(0, 20)}...
                      </code>
                      <button
                        onClick={() => handleCopyKey(key.api_key)}
                        className="btn btn-sm btn-secondary"
                        title="API Key kopieren"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${key.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {key.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td>{new Date(key.created_at).toLocaleDateString('de-DE')}</td>
                  <td>
                    <button
                      onClick={() => onSelectApiKey(key.id)}
                      className="btn btn-sm btn-primary"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Konfigurieren
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
