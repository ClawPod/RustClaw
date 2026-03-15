import { useState } from 'react';
import {
  Stethoscope,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { t, getLocale } from '@/lib/i18n';
import type { DiagResult } from '@/types/api';
import { runDoctor } from '@/lib/api';

function severityIcon(severity: DiagResult['severity']) {
  switch (severity) {
    case 'ok':
      return <CheckCircle className="h-4 w-4 text-status-success flex-shrink-0" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-status-warning flex-shrink-0" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-status-error flex-shrink-0" />;
  }
}

function severityBorder(severity: DiagResult['severity']): string {
  switch (severity) {
    case 'ok':
      return 'border-status-success/20';
    case 'warn':
      return 'border-status-warning/20';
    case 'error':
      return 'border-status-error/20';
  }
}

function severityBg(severity: DiagResult['severity']): string {
  switch (severity) {
    case 'ok':
      return 'var(--status-success-glow, rgba(0,230,138,0.04))';
    case 'warn':
      return 'var(--status-warning-glow, rgba(255,170,0,0.04))';
    case 'error':
      return 'var(--status-error-glow, rgba(255,68,102,0.04))';
  }
}

export default function Doctor() {
  const [results, setResults] = useState<DiagResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await runDoctor();
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('doctor.error_run'));
    } finally {
      setLoading(false);
    }
  };

  const okCount = results?.filter((r) => r.severity === 'ok').length ?? 0;
  const warnCount = results?.filter((r) => r.severity === 'warn').length ?? 0;
  const errorCount = results?.filter((r) => r.severity === 'error').length ?? 0;

  const grouped =
    results?.reduce<Record<string, DiagResult[]>>((acc, item) => {
      const key = item.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {}) ?? {};

  const locale = getLocale();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-accent-blue" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{t('doctor.title')}</h2>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="btn-electric flex items-center gap-2 text-sm px-4 py-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('doctor.running')}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {t('doctor.run')}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-status-error/15 border border-status-error/30 p-4 text-status-error animate-fade-in">
          {error}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="h-12 w-12 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin mb-4" />
          <p className="text-text-secondary">{t('doctor.loading_desc')}</p>
          <p className="text-sm text-text-muted mt-1">
            {t('doctor.loading_time_note')}
          </p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <>
          {/* Summary Bar */}
          <div className="glass-card flex items-center gap-4 p-4 animate-slide-in-up">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-status-success" />
              <span className="text-sm text-text-primary font-medium">
                {okCount} <span className="text-text-muted font-normal">{t('doctor.ok').toLowerCase()}</span>
              </span>
            </div>
            <div className="w-px h-5 bg-border-default" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-warning" />
              <span className="text-sm text-text-primary font-medium">
                {warnCount}{' '}
                <span className="text-text-muted font-normal">
                  {locale === 'zh' ? t('doctor.warnings') : (warnCount !== 1 ? 'warnings' : 'warning')}
                </span>
              </span>
            </div>
            <div className="w-px h-5 bg-border-default" />
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-status-error" />
              <span className="text-sm text-text-primary font-medium">
                {errorCount}{' '}
                <span className="text-text-muted font-normal">
                  {locale === 'zh' ? t('doctor.errors') : (errorCount !== 1 ? 'errors' : 'error')}
                </span>
              </span>
            </div>

            {/* Overall indicator */}
            <div className="ml-auto">
              {errorCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border text-status-error border-status-error/30" style={{ background: 'rgba(255,68,102,0.06)' }}>
                  {t('doctor.issues_found')}
                </span>
              ) : warnCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border text-status-warning border-status-warning/30" style={{ background: 'rgba(255,170,0,0.06)' }}>
                  {t('doctor.warn')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border text-status-success border-status-success/30" style={{ background: 'rgba(0,230,138,0.06)' }}>
                  {t('doctor.all_clear')}
                </span>
              )}
            </div>
          </div>

          {/* Grouped Results */}
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items], catIdx) => (
              <div key={category} className="animate-slide-in-up" style={{ animationDelay: `${(catIdx + 1) * 100}ms` }}>
                <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 capitalize">
                  {category}
                </h3>
                <div className="space-y-2 stagger-children">
                  {items.map((result, idx) => (
                    <div
                      key={`${category}-${idx}`}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 hover:translate-x-1 ${severityBorder(result.severity)} animate-slide-in-left`}
                      style={{ background: severityBg(result.severity) }}
                    >
                      {severityIcon(result.severity)}
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary">{result.message}</p>
                        <p className="text-[10px] text-text-muted mt-0.5 capitalize uppercase tracking-wider">
                          {t(`doctor.${result.severity}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}

      {/* Empty state */}
      {!results && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted animate-fade-in">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-float" style={{ background: 'var(--glow-blue)' }}>
            <Stethoscope className="h-8 w-8 text-accent-blue" />
          </div>
          <p className="text-lg font-semibold text-text-primary mb-1">{t('doctor.empty_title')}</p>
          <p className="text-sm text-text-muted">
            {t('doctor.empty_desc')}
          </p>
        </div>
      )}
    </div>
  );
}
