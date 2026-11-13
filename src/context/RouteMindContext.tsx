import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  INITIAL_ACTIVITY_EVENTS,
  INITIAL_ATTENDANCE,
  INITIAL_BUSES,
  INITIAL_DRIVERS,
  INITIAL_INSIGHTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ROUTES,
  INITIAL_STUDENTS,
} from '../data/demoData';
import type {
  ActivityEvent,
  AttendanceRecord,
  AttendanceStatus,
  Bus,
  BusStatus,
  DistrictSettings,
  Driver,
  NotificationItem,
  OperationalInsight,
  RouteTrip,
  Student,
} from '../types/transportation';

interface ToastMessage {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning';
}

interface RouteMindContextValue {
  buses: Bus[];
  drivers: Driver[];
  routes: RouteTrip[];
  students: Student[];
  attendance: AttendanceRecord[];
  activities: ActivityEvent[];
  insights: OperationalInsight[];
  notifications: NotificationItem[];
  settings: DistrictSettings;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedBusId: string | null;
  selectedBus: Bus | null;
  openBusDrawer: (busId: string) => void;
  closeBusDrawer: () => void;
  updateBusStatus: (busId: string, status: BusStatus, delayMinutes?: number) => void;
  simulateTelemetryTick: () => void;
  updateAttendanceStatus: (recordId: string, status: AttendanceStatus) => void;
  reassignStudentRoute: (studentId: string, routeId: string) => void;
  acknowledgeInsight: (insightId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (next: Partial<DistrictSettings>) => void;
  resetDemoData: () => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  pushToast: (message: string, tone?: ToastMessage['tone']) => void;
  totalEnrolledStudents: number;
}

const RouteMindContext = createContext<RouteMindContextValue | null>(null);

export const RouteMindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [drivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState<RouteTrip[]>(INITIAL_ROUTES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_EVENTS);
  const [insights, setInsights] = useState<OperationalInsight[]>(INITIAL_INSIGHTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<DistrictSettings>(DEFAULT_SETTINGS);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-13');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastMessage['tone'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  const openBusDrawer = useCallback((busId: string) => {
    setSelectedBusId(busId);
  }, []);

  const closeBusDrawer = useCallback(() => {
    setSelectedBusId(null);
  }, []);

  const selectedBus = useMemo(
    () => buses.find((b) => b.id === selectedBusId) ?? null,
    [buses, selectedBusId]
  );

  const updateBusStatus = useCallback(
    (busId: string, status: BusStatus, delayMinutes = 0) => {
      const target = buses.find((b) => b.id === busId);
      if (!target) return;

      const resolvedDelay = status === 'delayed' ? Math.max(5, delayMinutes) : 0;

      setBuses((prev) =>
        prev.map((bus) =>
          bus.id === busId
            ? {
                ...bus,
                status,
                delayMinutes: resolvedDelay,
                speedMph: status === 'idle' ? 0 : status === 'delayed' ? 12 : 26,
                lastUpdated: '08:02 AM',
              }
            : bus
        )
      );

      setRoutes((prev) =>
        prev.map((route) =>
          route.assignedBusId === busId && route.status !== 'completed'
            ? {
                ...route,
                status:
                  status === 'delayed'
                    ? 'delayed'
                    : status === 'idle'
                      ? 'scheduled'
                      : 'on_schedule',
                delayMinutes: resolvedDelay,
              }
            : route
        )
      );

      const newActivity: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: status === 'delayed' ? 'delay_detected' : 'trip_started',
        title:
          status === 'delayed'
            ? `Delay flagged on ${target.busNumber}`
            : status === 'active'
              ? `${target.busNumber} marked On Schedule`
              : `${target.busNumber} placed on Standby`,
        description:
          status === 'delayed'
            ? `${target.routeName} flagged +${resolvedDelay} min variance by dispatch.`
            : `${target.routeName} status updated in operations console.`,
        busNumber: target.busNumber,
        routeCode: target.routeId.toUpperCase(),
        timestamp: '08:02 AM',
        relativeTime: 'Just now',
      };
      setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

      pushToast(
        `${target.busNumber} updated to ${status === 'active' ? 'Active' : status === 'delayed' ? `Delayed (+${resolvedDelay}m)` : 'Idle'}.`,
        status === 'delayed' ? 'warning' : 'success'
      );
    },
    [buses, pushToast]
  );

  const simulateTelemetryTick = useCallback(() => {
    const nowLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setBuses((prev) =>
      prev.map((bus) => {
        if (bus.status === 'idle') return bus;
        const rad = (bus.headingDeg * Math.PI) / 180;
        const step = bus.status === 'delayed' ? 5 : 10;
        const nextX = Math.max(85, Math.min(915, Math.round(bus.mapCoords.x + Math.cos(rad) * step)));
        const nextY = Math.max(70, Math.min(535, Math.round(bus.mapCoords.y + Math.sin(rad) * step * 0.45)));
        const nextDist = Math.max(0.3, Number((bus.remainingDistanceMiles - 0.1).toFixed(1)));
        const jitterSpeed =
          bus.status === 'delayed'
            ? Math.max(8, Math.min(16, bus.speedMph + (Math.random() > 0.5 ? 1 : -1)))
            : Math.max(20, Math.min(31, bus.speedMph + (Math.random() > 0.5 ? 1 : -1)));

        return {
          ...bus,
          mapCoords: { x: nextX, y: nextY },
          remainingDistanceMiles: nextDist,
          speedMph: jitterSpeed,
          lastUpdated: nowLabel,
        };
      })
    );

    pushToast('Simulated demo coordinates refreshed.', 'info');
  }, [pushToast]);

  const updateAttendanceStatus = useCallback(
    (recordId: string, status: AttendanceStatus) => {
      const nowLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      let targetStudentId = '';
      let studentName = '';

      setAttendance((prev) =>
        prev.map((rec) => {
          if (rec.id !== recordId) return rec;
          targetStudentId = rec.studentId;
          studentName = rec.studentName;
          return {
            ...rec,
            status,
            timestamp: status === 'absent' || status === 'pending' ? null : nowLabel,
          };
        })
      );

      if (targetStudentId) {
        setStudents((prev) =>
          prev.map((stu) =>
            stu.id === targetStudentId
              ? {
                  ...stu,
                  todayStatus: status,
                  lastBoardedAt: status === 'boarded' ? nowLabel : stu.lastBoardedAt,
                }
              : stu
          )
        );

        if (status === 'boarded') {
          setActivities((prev) => [
            {
              id: `act-${Date.now()}`,
              type: 'student_boarded',
              title: `${studentName} marked boarded`,
              description: `Manual boarding confirmation logged by administrator.`,
              timestamp: nowLabel,
              relativeTime: 'Just now',
            },
            ...prev.slice(0, 9),
          ]);
        }

        pushToast(`Updated ${studentName} status to ${status.replace('_', ' ')}.`, 'success');
      }
    },
    [pushToast]
  );

  const reassignStudentRoute = useCallback(
    (studentId: string, routeId: string) => {
      const nextRoute = routes.find((r) => r.id === routeId);
      if (!nextRoute) return;

      setStudents((prev) =>
        prev.map((stu) =>
          stu.id === studentId
            ? {
                ...stu,
                routeId: nextRoute.id,
                routeCode: nextRoute.routeCode,
                routeName: nextRoute.routeName,
              }
            : stu
        )
      );

      setAttendance((prev) =>
        prev.map((rec) =>
          rec.studentId === studentId
            ? {
                ...rec,
                routeId: nextRoute.id,
                routeCode: nextRoute.routeCode,
                busNumber: nextRoute.assignedBusNumber,
              }
            : rec
        )
      );

      pushToast(`Student reassigned to ${nextRoute.routeCode} (${nextRoute.routeName}).`, 'success');
    },
    [routes, pushToast]
  );

  const acknowledgeInsight = useCallback(
    (insightId: string) => {
      setInsights((prev) =>
        prev.map((ins) => (ins.id === insightId ? { ...ins, acknowledged: true } : ins))
      );
      pushToast('Operational recommendation acknowledged.', 'success');
    },
    [pushToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateSettings = useCallback(
    (next: Partial<DistrictSettings>) => {
      setSettings((prev) => ({ ...prev, ...next }));
      pushToast('District operational settings saved.', 'success');
    },
    [pushToast]
  );

  const resetDemoData = useCallback(() => {
    setBuses(INITIAL_BUSES);
    setRoutes(INITIAL_ROUTES);
    setStudents(INITIAL_STUDENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setActivities(INITIAL_ACTIVITY_EVENTS);
    setInsights(INITIAL_INSIGHTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(DEFAULT_SETTINGS);
    pushToast('Demo dataset restored to initial state.', 'info');
  }, [pushToast]);

  const totalEnrolledStudents = 648;

  return (
    <RouteMindContext.Provider
      value={{
        buses,
        drivers,
        routes,
        students,
        attendance,
        activities,
        insights,
        notifications,
        settings,
        selectedDate,
        setSelectedDate,
        selectedBusId,
        selectedBus,
        openBusDrawer,
        closeBusDrawer,
        updateBusStatus,
        simulateTelemetryTick,
        updateAttendanceStatus,
        reassignStudentRoute,
        acknowledgeInsight,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetDemoData,
        toasts,
        dismissToast,
        pushToast,
        totalEnrolledStudents,
      }}
    >
      {children}
    </RouteMindContext.Provider>
  );
};

export function useRouteMind() {
  const ctx = useContext(RouteMindContext);
  if (!ctx) throw new Error('useRouteMind must be used inside RouteMindProvider');
  return ctx;
}
