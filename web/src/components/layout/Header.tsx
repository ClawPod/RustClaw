import { useLocation } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useLocaleContext, useTheme } from '@/App';
import { useAuth } from '@/hooks/useAuth';

const routeTitles: Record<string, string> = {
  '/': 'nav.dashboard',
  '/agent': 'nav.agent',
  '/tools': 'nav.tools',
  '/cron': 'nav.cron',
  '/integrations': 'nav.integrations',
  '/memory': 'nav.memory',
  '/config': 'nav.config',
  '/cost': 'nav.cost',
  '/logs': 'nav.logs',
  '/doctor': 'nav.doctor',
};

export default function Header() {
  const location = useLocation();
  const { logout } = useAuth();
  const { locale, setAppLocale } = useLocaleContext();
  const { theme, toggleTheme } = useTheme();

  const titleKey = routeTitles[location.pathname] ?? 'nav.dashboard';
  const pageTitle = t(titleKey);

  const toggleLanguage = () => {
    setAppLocale(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border-default/40 animate-fade-in" style={{ background: 'var(--header-bg)', backdropFilter: 'blur(12px)' }}>
      {/* Page title */}
      <h1 className="text-lg font-semibold text-text-primary tracking-tight">{pageTitle}</h1>

      {/* Right-side controls */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-border-default text-text-secondary hover:text-accent-blue hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all duration-300"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        {/* Language switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-lg text-xs font-semibold border border-border-default text-text-secondary hover:text-text-primary hover:border-accent-blue/40 hover:bg-accent-blue/10 transition-all duration-300"
        >
          {locale === 'zh' ? 'ZH' : 'EN'}
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-status-error hover:bg-status-error/10 transition-all duration-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </header>
  );
}
