import { useTranslation } from 'react-i18next';
import {
  AppCard,
  AppButton,
  ThemeToggle,
  LanguageSwitcher,
  ColorPicker,
} from '../../../../core/widgets';
import { useAppSelector } from '../../../../app/hooks';
import { usePreferences } from '../../../preferences/usePreferences';
import { roleLabel } from '../../models/Role';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-label text-content-muted">{label}</p>
      <p className="mt-0.5 text-sm text-content">{value || '—'}</p>
    </div>
  );
}

export default function ProfileView() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { theme, language, accentColor, toggleTheme, setLanguage, setAccentColor, reset } =
    usePreferences();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-xl font-bold tracking-tight text-content">{t('profile.title')}</h1>

      <AppCard className="flex flex-col gap-4 p-5">
        <Field label={t('profile.name')} value={user?.displayName ?? ''} />
        <Field label={t('profile.email')} value={user?.email ?? ''} />
        <Field label={t('profile.role')} value={user ? roleLabel(user.role) : ''} />
      </AppCard>

      <AppCard className="flex flex-col gap-5 p-5">
        <p className="text-sm font-semibold text-content">{t('profile.preferences')}</p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-content">{t('profile.theme')}</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-content">{t('profile.language')}</span>
          <LanguageSwitcher language={language} onChange={setLanguage} />
        </div>

        <ColorPicker
          label={t('profile.accentColor')}
          value={accentColor}
          onChange={setAccentColor}
        />

        <div>
          <AppButton variant="secondary" size="sm" onClick={reset}>
            {t('common.reset')}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
