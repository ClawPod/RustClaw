import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Hash,
  Layers,
} from 'lucide-react';
import { t } from '@/lib/i18n';
import type { CostSummary } from '@/types/api';
import { getCost } from '@/lib/api';

function formatUSD(value: number): string {
  return `$${value.toFixed(4)}`;
}

export default function Cost() {
  const [cost, setCost] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCost()
      .then(setCost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="rounded-xl bg-status-error/15 border border-status-error/30 p-4 text-status-error">
          {t('cost.load_error')}: {error}
        </div>
      </div>
    );
  }

  if (loading || !cost) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  const models = Object.values(cost.by_model);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { icon: DollarSign, color: 'var(--accent-blue)', bg: 'rgba(0, 128, 255, 0.1)', label: t('cost.session'), value: formatUSD(cost.session_cost_usd) },
          { icon: TrendingUp, color: 'var(--status-success)', bg: 'rgba(0, 230, 138, 0.1)', label: t('cost.daily'), value: formatUSD(cost.daily_cost_usd) },
          { icon: Layers, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', label: t('cost.monthly'), value: formatUSD(cost.monthly_cost_usd) },
          { icon: Hash, color: '#ff8800', bg: 'rgba(255, 136, 0, 0.1)', label: t('cost.total_requests'), value: cost.request_count.toLocaleString() },
        ].map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label} className="glass-card p-5 animate-slide-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Token Statistics */}
      <div className="glass-card p-5 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
          {t('cost.token_stats')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t('cost.total_tokens'), value: cost.total_tokens.toLocaleString() },
            { label: t('cost.avg_tokens'), value: cost.request_count > 0 ? Math.round(cost.total_tokens / cost.request_count).toLocaleString() : '0' },
            { label: t('cost.cost_per_1k'), value: cost.total_tokens > 0 ? formatUSD((cost.monthly_cost_usd / cost.total_tokens) * 1000) : '$0.0000' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(0,128,255,0.04)', border: '1px solid var(--border-default)' }}>
              <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
              <p className="text-xl font-bold text-text-primary mt-1 font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Model Breakdown Table */}
      <div className="glass-card overflow-hidden animate-slide-in-up" style={{ animationDelay: '300ms' }}>
        <div className="px-5 py-4 border-b border-border-default">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            {t('cost.model_breakdown')}
          </h3>
        </div>
        {models.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            {t('cost.no_data')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-electric">
              <thead>
                <tr>
                  <th className="text-left">{t('cost.model')}</th>
                  <th className="text-right">{t('cost.usd')}</th>
                  <th className="text-right">{t('cost.tokens')}</th>
                  <th className="text-right">{t('cost.requests')}</th>
                  <th className="text-left">{t('cost.share')}</th>
                </tr>
              </thead>
              <tbody>
                {models
                  .sort((a, b) => b.cost_usd - a.cost_usd)
                  .map((m) => {
                    const share =
                      cost.monthly_cost_usd > 0
                        ? (m.cost_usd / cost.monthly_cost_usd) * 100
                        : 0;
                    return (
                      <tr key={m.model}>
                        <td className="px-5 py-3 text-text-primary font-medium text-sm">
                          {m.model}
                        </td>
                        <td className="px-5 py-3 text-text-secondary text-right font-mono text-sm">
                          {formatUSD(m.cost_usd)}
                        </td>
                        <td className="px-5 py-3 text-text-secondary text-right text-sm">
                          {m.total_tokens.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-text-secondary text-right text-sm">
                          {m.request_count.toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full progress-bar-animated transition-all duration-700"
                                style={{ width: `${Math.max(share, 2)}%`, background: 'var(--accent-blue)' }}
                              />
                            </div>
                            <span className="text-xs text-text-muted w-10 text-right font-mono">
                              {share.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
