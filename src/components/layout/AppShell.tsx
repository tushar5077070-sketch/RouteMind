import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useRouteMind } from '../../context/RouteMindContext';
import { BusDetailDrawer } from '../fleet/BusDetailDrawer';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { toasts, dismissToast } = useRouteMind();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      <BusDetailDrawer />

      {/* Non-intrusive Toast Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-[#0B1324] text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700/80"
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
