import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bus as BusIcon,
  CheckCircle2,
  Clock,
  Info,
  Route as RouteIcon,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouteMind } from '../context/RouteMindContext';
import { FleetActivityMap } from '../components/overview/FleetActivityMap';
import { WeeklyAnalyticsCharts } from '../components/overview/WeeklyAnalyticsCharts';
import type { ActivityEventType } from '../types/transportation';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    buses,
    routes,
    activities,
    insights,
    totalEnrolledStudents,
    openBusDrawer,
    acknowledgeInsight,
  } = useRouteMind();

  const [activityFilter, setActivityFilter] = useState<'all' | ActivityEventType>('all');

  const activeBusCount = useMemo(
    () => buses.filter((b) => b.status === 'active').length,
    [buses]
  );
  const delayedTripCount = useMemo(
    () => routes.filter((r) => r.status === 'delayed').length,
    [routes]
  );

  const filteredActivities = useMemo(
    () =>
      activityFilter === 'all'
        ? activities
        : activities.filter((a) => a.type === activityFilter),
    [activities, activityFilter]
  );

  const kpiCards = [
    {
      label: 'Total Buses',
      value: buses.length,
      context: '15 assigned · 3 reserve',
      icon: BusIcon,
      accent: 'text-slate-700',
      onClick: () => navigate('/fleet'),
    },
    {
      label: 'Active Buses',
      value: activeBusCount,
      context: 'On schedule in service',
      icon: CheckCircle2,
      accent: 'text-emerald-600',
      onClick: () => navigate('/fleet'),
    },
    {
      label: 'Students Enrolled',
      value: totalEnrolledStudents,
      context: 'Across 4 district schools',
      icon: Users,
      accent: 'text-blue-600',
      onClick: () => navigate('/students'),
    },
    {
      label: 'Trips Today',
      value: routes.length,
      context: '6 completed · 15 active · 3 upcoming',
      icon: RouteIcon,
      accent: 'text-slate-700',
      onClick: () => navigate('/routes'),
    },
    {
      label: 'Delayed Trips',
      value: delayedTripCount,
      context: delayedTripCount > 0 ? 'Requires dispatch review' : 'All corridors clear',
      icon: AlertTriangle,
      accent: delayedTripCount > 0 ? 'text-amber-600' : 'text-emerald-600',
      onClick: () => navigate('/routes'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <section aria-label="Key operational metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              className="text-left bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <Icon className={`w-4 h-4 shrink-0 ${kpi.accent}`} />
              </div>
              <p className="text-2xl font-semibold text-slate-900 mt-2 tabular-nums tracking-tight">
                {kpi.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{kpi.context}</p>
            </button>
          );
        })}
      </section>

      {/* Main Split: Fleet Activity Map + AI Operational Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7">
          <FleetActivityMap />
        </div>

        {/* B. AI Operational Insights */}
        <section className="xl:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">AI Operational Insights</h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Demo rule-based projections · Not live ML inference
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/intelligence')}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {insights.map((insight) => {
              const targetBus = buses.find((b) => b.busNumber === insight.affectedBusNumber);
              return (
                <div key={insight.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className={`font-semibold ${
                            insight.severity === 'critical'
                              ? 'text-rose-700'
                              : insight.severity === 'warning'
                                ? 'text-amber-700'
                                : 'text-blue-700'
                          }`}
                        >
                          {insight.category === 'delay_prediction'
                            ? 'Delay Projection'
                            : insight.category === 'unusual_pattern'
                              ? 'Pattern Alert'
                              : 'Route Performance'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {insight.confidencePct}% demo confidence
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-slate-900 mt-1">
                        {insight.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{insight.summary}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Basis: {insight.explanation}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">{insight.basisLabel}</span>
                    <div className="flex items-center gap-2">
                      {targetBus && (
                        <button
                          type="button"
                          onClick={() => openBusDrawer(targetBus.id)}
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                        >
                          Inspect {targetBus.busNumber}
                        </button>
                      )}
                      {!insight.acknowledged ? (
                        <button
                          type="button"
                          onClick={() => acknowledgeInsight(insight.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700">
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* C. Recent Activity & D. Weekly Transport Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Boarding, trips, and delay events</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'delay_detected', label: 'Delays' },
                  { id: 'student_boarded', label: 'Boarding' },
                  { id: 'trip_completed', label: 'Completed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivityFilter(tab.id)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                    activityFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((act) => (
                <div key={act.id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {act.type === 'delay_detected' && (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    {act.type === 'student_boarded' && (
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                    )}
                    {act.type === 'trip_started' && (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                    {act.type === 'trip_completed' && (
                      <Info className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">{act.title}</p>
                      <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                        {act.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No activity events match the selected filter.
              </div>
            )}
          </div>
        </section>

        <div className="xl:col-span-7">
          <WeeklyAnalyticsCharts />
        </div>
      </div>
    </div>
  );
};
