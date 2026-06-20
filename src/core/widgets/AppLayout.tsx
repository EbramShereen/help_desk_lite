import type { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { QuoteBanner } from '../../features/quotes/ui/widgets/QuoteBanner';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <QuoteBanner />
        {children}
      </main>
    </div>
  );
}
