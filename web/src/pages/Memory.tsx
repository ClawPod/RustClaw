import { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Plus,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import { t } from '@/lib/i18n';
import type { MemoryEntry } from '@/types/api';
import { getMemory, storeMemory, deleteMemory } from '@/lib/api';

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function Memory() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = (q?: string, cat?: string) => {
    setLoading(true);
    getMemory(q || undefined, cat || undefined)
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSearch = () => {
    fetchEntries(search, categoryFilter);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const categories = Array.from(new Set(entries.map((e) => e.category))).sort();

  const handleAdd = async () => {
    if (!formKey.trim() || !formContent.trim()) {
      setFormError(t('memory.form_error_required'));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await storeMemory(
        formKey.trim(),
        formContent.trim(),
        formCategory.trim() || undefined,
      );
      fetchEntries(search, categoryFilter);
      setShowForm(false);
      setFormKey('');
      setFormContent('');
      setFormCategory('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t('memory.form_error_add'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteMemory(key);
      setEntries((prev) => prev.filter((e) => e.key !== key));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('memory.form_error_delete'));
    } finally {
      setConfirmDelete(null);
    }
  };

  if (error && entries.length === 0) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="rounded-xl bg-status-error/15 border border-status-error/30 p-4 text-status-error">
          {t('memory.load_error')}: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent-blue" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            {t('memory.title')} ({entries.length})
          </h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-electric flex items-center gap-2 text-sm px-4 py-2"
        >
          <Plus className="h-4 w-4" />
          {t('memory.add')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('memory.search_placeholder')}
            className="input-electric w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-electric pl-10 pr-8 py-2.5 text-sm appearance-none cursor-pointer"
          >
            <option value="">{t('memory.all_categories')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="btn-electric px-4 py-2.5 text-sm"
        >
          {t('common.search')}
        </button>
      </div>

      {/* Error banner (non-fatal) */}
      {error && (
        <div className="rounded-xl bg-status-error/15 border border-status-error/30 p-3 text-sm text-status-error animate-fade-in">
          {error}
        </div>
      )}

      {/* Add Memory Form Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{t('memory.add_memory_title')}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="text-text-muted hover:text-text-primary transition-colors duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-status-error/15 border border-status-error/30 p-3 text-sm text-status-error animate-fade-in">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  {t('memory.form_key')} <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="e.g. user_preferences"
                  className="input-electric w-full px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  {t('memory.form_content')} <span className="text-status-error">*</span>
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Memory content..."
                  rows={4}
                  className="input-electric w-full px-3 py-2.5 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  {t('memory.form_category')}
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. preferences, context, facts"
                  className="input-electric w-full px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-default rounded-xl hover:bg-accent-blue/5 transition-all duration-300"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting}
                className="btn-electric px-4 py-2 text-sm font-medium"
              >
                {submitting ? t('memory.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Brain className="h-10 w-10 text-border-default mx-auto mb-3" />
          <p className="text-text-muted">{t('memory.no_entries')}</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="table-electric">
            <thead>
              <tr>
                <th className="text-left">{t('memory.key')}</th>
                <th className="text-left">{t('memory.content')}</th>
                <th className="text-left">{t('memory.category')}</th>
                <th className="text-left">{t('memory.timestamp')}</th>
                <th className="text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-text-primary font-medium font-mono text-xs">
                    {entry.key}
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[300px] text-sm">
                    <span title={entry.content}>
                      {truncate(entry.content, 80)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize border border-border-default text-text-secondary" style={{ background: 'var(--glow-blue, rgba(0,128,255,0.06))' }}>
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                    {formatDate(entry.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDelete === entry.key ? (
                      <div className="flex items-center justify-end gap-2 animate-fade-in">
                        <span className="text-xs text-status-error">{t('memory.delete_confirm')}</span>
                        <button
                          onClick={() => handleDelete(entry.key)}
                          className="text-status-error hover:text-status-error/80 text-xs font-medium"
                        >
                          {t('common.yes')}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-text-muted hover:text-text-primary text-xs font-medium"
                        >
                          {t('common.no')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(entry.key)}
                        className="text-text-muted hover:text-status-error transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
