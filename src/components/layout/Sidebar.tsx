import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bus as BusIcon,
  ClipboardCheck,
  LayoutDashboard,
  MapPin,
  Route as RouteIcon,
  Settings,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { ADMIN_PROFILE } from '../../data/demoData';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/fleet', label: 'Live Fleet', icon: MapPin },
  { to: '/routes', label: 'Routes & Trips', icon: RouteIcon },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/drivers', label: 'Drivers', icon: UserCheck },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/intelligence', label: 'AI Intelligence', icon: Sparkles },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const [avatarError, setAvatarError] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 bg-[#0B1324] text-slate-200 border-r border-slate-800/80 select-none">
      {/* Brand Lockup */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 shrink-0">
        <NavLink
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <BusIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight whitespace-nowrap">
            RouteMind
          </span>
        </NavLink>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600/15 text-white border border-blue-500/30'
                  : 'text-slate-300/85 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Administrator Profile */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {!avatarError ? (
            <img
              src={ADMIN_PROFILE.avatarUrl}
              alt={ADMIN_PROFILE.name}
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
              className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              EV
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white truncate">{ADMIN_PROFILE.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{ADMIN_PROFILE.role}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile slide-over sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
