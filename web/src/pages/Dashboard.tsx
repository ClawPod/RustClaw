import { useState, useEffect } from 'react';
import {
  Cpu,
  Clock,
  Globe,
  Database,
  Activity,
  DollarSign,
  Radio,
} from 'lucide-react';
import { t } from '@/lib/i18n';
import type { StatusResponse, CostSummary } from '@/types/api';
import { getStatus, getCost } from '@/lib/api';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatUSD(value: number): string {
  return `$${value.toFixed(4)}`;
}

function healthColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'ok':
    case 'healthy':
      return 'bg-status-success';
    case 'warn':
    case 'warning':
    case 'degraded':
      return 'bg-status-warning';
    default:
      return 'bg-status-error';
  }
}

function healthBorder(status: string): string {
  switch (status.toLowerCase()) {
    case 'ok':
    case 'healthy':
      return 'border-status-success/30';
    case 'warn':
    case 'warning':
    case 'degraded':
      return 'border-status-warning/30';
    default:
      return 'border-status-error/30';
  }
}

export default function Dashboard() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [cost, setCost] = useState<CostSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getStatus(), getCost()])
      .then(([s, c]) => {
        setStatus(s);
        setCost(c);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="rounded-xl bg-status-error/15 border border-status-error/30 p-4 text-status-error">
          {t('dashboard.load_error')}: {error}
        </div>
      </div>
    );
  }

  if (!status || !cost) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  const maxCost = Math.max(cost.session_cost_usd, cost.daily_cost_usd, cost.monthly_cost_usd, 0.001);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { icon: Cpu, color: 'var(--accent-blue)', bg: 'rgba(0, 128, 255, 0.1)', label: t('dashboard.provider_model'), value: status.provider ?? 'Unknown', sub: status.model },
          { icon: Clock, color: 'var(--status-success)', bg: 'rgba(0, 230, 138, 0.1)', label: t('dashboard.uptime'), value: formatUptime(status.uptime_seconds), sub: t('dashboard.since_restart') },
          { icon: Globe, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', label: t('dashboard.gateway_port'), value: `:${status.gateway_port}`, sub: `${t('dashboard.locale')}: ${status.locale}` },
          { icon: Database, color: '#ff8800', bg: 'rgba(255, 136, 0, 0.1)', label: t('dashboard.memory_backend'), value: status.memory_backend, sub: `${t('dashboard.paired')}: ${status.paired ? t('common.yes') : t('common.no')}` },
        ].map(({ icon: Icon, color, bg, label, value, sub }) => (
          <div key={label} className="glass-card p-5 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-lg font-semibold text-text-primary truncate capitalize">{value}</p>
            <p className="text-sm text-text-muted truncate">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        {/* Cost Widget */}
        <div className="glass-card p-5 animate-slide-in-up">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="h-5 w-5 text-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t('dashboard.cost_overview')}</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: t('cost.session'), value: cost.session_cost_usd, color: 'var(--accent-blue)' },
              { label: t('cost.daily'), value: cost.daily_cost_usd, color: 'var(--status-success)' },
              { label: t('cost.monthly'), value: cost.monthly_cost_usd, color: '#a855f7' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-muted">{label}</span>
                  <span className="text-text-primary font-medium font-mono">{formatUSD(value)}</span>
                </div>
                <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar-animated transition-all duration-700 ease-out"
                    style={{ width: `${Math.max((value / maxCost) * 100, 2)}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border-default/50 flex justify-between text-sm">
            <span className="text-text-muted">{t('cost.total_tokens')}</span>
            <span className="text-text-primary font-mono">{cost.total_tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-text-muted">{t('cost.request_count')}</span>
            <span className="text-text-primary font-mono">{cost.request_count.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Channels */}
        <div className="glass-card p-5 animate-slide-in-up">
          <div className="flex items-center gap-2 mb-5">
            <Radio className="h-5 w-5 text-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t('dashboard.channels')}</h2>
          </div>
          <div className="space-y-2">
            {Object.entries(status.channels).length === 0 ? (
              <p className="text-sm text-text-muted">{t('dashboard.no_channels')}</p>
            ) : (
              Object.entries(status.channels).map(([name, active]) => (
                <div
                  key={name}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-300 hover:bg-accent-blue/5 bg-bg-secondary/50"
                >
                  <span className="text-sm text-text-primary capitalize font-medium">{name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full glow-dot ${
                        active ? 'text-status-success bg-status-success' : 'text-text-muted bg-text-muted'
                      }`}
                    />
                    <span className="text-xs text-text-muted">
                      {active ? t('common.status_active') : t('common.status_inactive')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Health Grid */}
        <div className="glass-card p-5 animate-slide-in-up">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="h-5 w-5 text-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t('dashboard.health')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(status.health.components).length === 0 ? (
              <p className="text-sm text-text-muted col-span-2">{t('dashboard.no_components')}</p>
            ) : (
              Object.entries(status.health.components).map(([name, comp]) => (
                <div
                  key={name}
                  className={`rounded-xl p-3 border ${healthBorder(comp.status)} transition-all duration-300 hover:scale-[1.02] bg-bg-secondary/50`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${healthColor(comp.status)} glow-dot`} />
                    <span className="text-sm font-medium text-text-primary capitalize truncate">
                      {name}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted capitalize">{comp.status}</p>
                  {comp.restart_count > 0 && (
                    <p className="text-xs text-status-warning mt-1">
                      {t('health.restart_count')}: {comp.restart_count}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
