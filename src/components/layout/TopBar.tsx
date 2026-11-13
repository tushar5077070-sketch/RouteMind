import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bus as BusIcon,
  Calendar,
  Check,
  ChevronDown,
  Menu,
  RotateCcw,
  Route as RouteIcon,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { ADMIN_PROFILE } from '../../data/demoData';
import { useRouteMind } from '../../context/RouteMindContext';

interface TopBarProps {
  onOpenMobileNav: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Overview', breadcrumb: 'Operations / Command Center' },
  '/fleet': { title: 'Live Fleet', breadcrumb: 'Operations / Fleet Monitor' },
  '/routes': { title: 'Routes & Trips', breadcrumb: 'Operations / Route Schedule' },
  '/students': { title: 'Students', breadcrumb: 'Directory / Enrolled Riders' },
  '/drivers': { title: 'Drivers', breadcrumb: 'Directory / Operators' },
  '/attendance': { title: 'Attendance', breadcrumb: 'Daily Logs / Boarding Verification' },
  '/intelligence': { title: 'AI Intelligence', breadcrumb: 'Analytics / ETA & Delay Insights' },
  '/reports': { title: 'Reports & Analytics', breadcrumb: 'Analytics / District Reports' },
  '/settings': { title: 'Settings', breadcrumb: 'System / District Preferences' },
};

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileNav }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    buses,
    routes,
    students,
    drivers,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    selectedDate,
    setSelectedDate,
    openBusDrawer,
    resetDemoData,
    pushToast,
  } = useRouteMind();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const meta = ROUTE_TITLES[location.pathname] ?? ROUTE_TITLES['/'];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setSearchFocused(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const items: {
      id: string;
      kind: 'Bus' | 'Route' | 'Student' | 'Driver';
      label: string;
      sublabel: string;
      action: () => void;
    }[] = [];

    buses
      .filter(
        (b) =>
          b.busNumber.toLowerCase().includes(q) ||
          b.registrationNumber.toLowerCase().includes(q) ||
          b.routeName.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((b) =>
        items.push({
          id: `s-bus-${b.id}`,
          kind: 'Bus',
          label: `${b.busNumber} · ${b.routeName}`,
          sublabel: `${b.registrationNumber} · ${b.driverName}`,
          action: () => {
            openBusDrawer(b.id);
            setSearchFocused(false);
            setSearchQuery('');
          },
        })
      );

    routes
      .filter(
        (r) =>
          r.routeCode.toLowerCase().includes(q) ||
          r.routeName.toLowerCase().includes(q) ||
          r.school.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((r) =>
        items.push({
          id: `s-rt-${r.id}`,
          kind: 'Route',
          label: `${r.routeCode} · ${r.routeName}`,
          sublabel: `${r.school} · ${r.assignedBusNumber}`,
          action: () => {
            navigate('/routes');
            setSearchFocused(false);
            setSearchQuery('');
          },
        })
      );

    students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentCode.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((s) =>
        items.push({
          id: `s-stu-${s.id}`,
          kind: 'Student',
          label: `${s.name} (${s.studentCode})`,
          sublabel: `${s.grade} · ${s.routeCode}`,
          action: () => {
            navigate('/students');
            setSearchFocused(false);
            setSearchQuery('');
          },
        })
      );

    drivers
      .filter((d) => d.name.toLowerCase().includes(q) || d.employeeCode.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((d) =>
        items.push({
          id: `s-drv-${d.id}`,
          kind: 'Driver',
          label: d.name,
          sublabel: `${d.employeeCode} · ${d.assignedBusNumber ?? 'Unassigned'}`,
          action: () => {
            navigate('/drivers');
            setSearchFocused(false);
            setSearchQuery('');
          },
        })
      );

    return items.slice(0, 8);
  }, [buses, routes, students, drivers, searchQuery, openBusDrawer, navigate]);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Breadcrumb & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 truncate">{meta.breadcrumb}</p>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Right: Global Search, Date, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Global Search */}
        <div ref={searchRef} className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Search buses, routes, students..."
            aria-label="Global search"
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-colors"
          />
          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute right-0 left-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors"
                  >
                    <span className="mt-0.5 text-slate-400 shrink-0">
                      {item.kind === 'Bus' && <BusIcon className="w-3.5 h-3.5" />}
                      {item.kind === 'Route' && <RouteIcon className="w-3.5 h-3.5" />}
                      {item.kind === 'Student' && <Users className="w-3.5 h-3.5" />}
                      {item.kind === 'Driver' && <User className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-900 truncate">{item.label}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.kind} · {item.sublabel}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-500">
                  No matching buses, routes, or students found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date Selector */}
        <label className="hidden sm:flex items-center gap-1.5 h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                pushToast(`Viewing schedule for ${e.target.value}.`, 'info');
              }
            }}
            aria-label="Operational date"
            className="bg-transparent text-xs font-medium text-slate-700 tabular-nums focus:outline-none cursor-pointer"
          />
        </label>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label="Open notifications"
            className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-slate-900">Dispatch Notifications</h2>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    {unreadCount} unread operational alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(item.id);
                      setNotifOpen(false);
                      navigate(item.targetPath);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                      item.read ? 'bg-white' : 'bg-blue-50/35'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          item.severity === 'critical'
                            ? 'text-rose-700'
                            : item.severity === 'warning'
                              ? 'text-amber-700'
                              : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Administrator Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            aria-label="Administrator profile menu"
            className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            {!avatarError ? (
              <img
                src={ADMIN_PROFILE.avatarUrl}
                alt={ADMIN_PROFILE.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center">
                EV
              </div>
            )}
            <span className="hidden xl:inline text-xs font-medium text-slate-800 whitespace-nowrap">
              {ADMIN_PROFILE.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{ADMIN_PROFILE.name}</p>
                <p className="text-[11px] text-slate-500">{ADMIN_PROFILE.email}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{ADMIN_PROFILE.district}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>District & Alert Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/intelligence');
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <RouteIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>ETA Calculation Workspace</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setProfileOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Demo Dataset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
