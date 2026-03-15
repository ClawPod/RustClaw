import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { getConfig, putConfig } from '@/lib/api';

export default function Config() {
  const [config, setConfig] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getConfig()
      .then((data) => {
        setConfig(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await putConfig(config);
      setSuccess(t('config.saved'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('config.error'));
    } finally {
      setSaving(false);
    }
  };

  // Auto-dismiss success after 4 seconds
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent-blue" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t('config.title')}</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-electric flex items-center gap-2 text-sm px-4 py-2"
        >
          <Save className="h-4 w-4" />
          {saving ? t('config.saving') : t('config.save')}
        </button>
      </div>

      {/* Sensitive fields note */}
      <div className="flex items-start gap-3 rounded-xl p-4 border border-status-warning/20" style={{ background: 'var(--status-warning-glow, rgba(255,170,0,0.05))' }}>
        <ShieldAlert className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-status-warning font-medium">
            {t('config.sensitive_note')}
          </p>
          <p className="text-sm text-status-warning/80 mt-0.5">
            {t('config.sensitive_desc')}
          </p>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl p-3 border border-status-success/30 animate-fade-in" style={{ background: 'var(--status-success-glow, rgba(0,230,138,0.06))' }}>
          <CheckCircle className="h-4 w-4 text-status-success flex-shrink-0" />
          <span className="text-sm text-status-success">{success}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl p-3 border border-status-error/30 animate-fade-in" style={{ background: 'var(--status-error-glow, rgba(255,68,102,0.06))' }}>
          <AlertTriangle className="h-4 w-4 text-status-error flex-shrink-0" />
          <span className="text-sm text-status-error">{error}</span>
        </div>
      )}

      {/* Config Editor */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default" style={{ background: 'rgba(0,128,255,0.03)' }}>
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
            {t('config.editor_title')}
          </span>
          <span className="text-[10px] text-text-muted">
            {config.split('\n').length} {t('config.lines')}
          </span>
        </div>
        <textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[500px] text-text-secondary font-mono text-sm p-4 resize-y focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:ring-inset"
          style={{ background: 'var(--bg-input)', tabSize: 4 }}
        />
      </div>
    </div>
  );
}
