import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../app/hooks';
import { useAuthController } from '../../features/auth/logic/useAuthController';
import { usePermissions } from '../../features/auth/logic/usePermissions';
import { usePreferences } from '../../features/preferences/usePreferences';
import { cn } from '../../lib/cn';
import { AppButton } from './AppButton';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Permission } from '../../features/admin/models/Permission';
import { NAV_ACCESS } from '../../routes/navAccess';

interface NavItem {
  labelKey: string;
  to: string;
  /** Item shows for these base roles regardless of permissions. */
  roles?: string[];
  /**
   * Item shows if the user has ANY of these permissions. Mirrors the route's
   * `PermissionGuard anyOf` so a visible tab is always reachable.
   */
  anyOf?: readonly Permission[];
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.tickets', to: '/tickets', anyOf: NAV_ACCESS.tickets },
  { labelKey: 'nav.board', to: '/board', anyOf: NAV_ACCESS.board },
  { labelKey: 'nav.backlog', to: '/backlog', anyOf: NAV_ACCESS.backlog },
  { labelKey: 'nav.timeline', to: '/timeline', anyOf: NAV_ACCESS.timeline },
  { labelKey: 'nav.summary', to: '/summary', anyOf: NAV_ACCESS.summary },
  { labelKey: 'nav.epics', to: '/epics', anyOf: NAV_ACCESS.epics },
  { labelKey: 'nav.sprints', to: '/sprints', anyOf: NAV_ACCESS.sprints },
  { labelKey: 'nav.teams', to: '/teams', anyOf: NAV_ACCESS.teams },
  { labelKey: 'nav.teamProgress', to: '/team-progress', anyOf: NAV_ACCESS.teamProgress },
  { labelKey: 'nav.users', to: '/admin/users', roles: ['admin'] },
  { labelKey: 'nav.roles', to: '/admin/roles', anyOf: NAV_ACCESS.roles },
  { labelKey: 'nav.workflow', to: '/admin/workflow', anyOf: NAV_ACCESS.workflow },
  { labelKey: 'nav.profile', to: '/profile' },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { logout } = useAuthController();
  const { canAny } = usePermissions();
  const { theme, language, toggleTheme, setLanguage } = usePreferences();

  const role = user?.role ?? '';
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles) return item.roles.includes(role);
    if (item.anyOf) return canAny(...item.anyOf);
    return true;
  });

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-surface-border bg-surface">
      <div className="px-5 py-6">
        <h2 className="text-lg font-bold tracking-tightest text-primary">HelpDesk</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-control px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary-subtle text-primary'
                  : 'text-content-muted hover:bg-surface-muted hover:text-content',
              )
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-surface-border px-3 py-4">
        <div className="mb-3 flex items-center justify-between px-3">
          <LanguageSwitcher language={language} onChange={setLanguage} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <p className="mb-2 truncate px-3 text-xs text-content-subtle">
          {user?.displayName || user?.email}
        </p>
        <AppButton
          variant="ghost"
          size="sm"
          fullWidth
          onClick={() => logout.mutate()}
          isLoading={logout.isPending}
        >
          {t('common.signOut')}
        </AppButton>
      </div>
    </aside>
  );
}
