import AppRoutes from './routes/AppRoutes';
import { usePreferences } from './features/preferences/usePreferences';

export default function App() {
  // Applies theme (dark class), language/dir, and accent override to the document.
  usePreferences();
  return <AppRoutes />;
}
