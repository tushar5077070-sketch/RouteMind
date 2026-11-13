import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  WEEKLY_ANALYTICS_LAST_WEEK,
  WEEKLY_ANALYTICS_THIS_WEEK,
} from '../../data/demoData';

export const WeeklyAnalyticsCharts: React.FC = () => {
  const [weekRange, setWeekRange] = useState<'this_week' | 'last_week'>('this_week');
  const data =
    weekRange === 'this_week' ? WEEKLY_ANALYTICS_THIS_WEEK : WEEKLY_ANALYTICS_LAST_WEEK;

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Weekly Transport Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Completed trips, average journey duration, and daily delay counts
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setWeekRange('this_week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              weekRange === 'this_week'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setWeekRange('last_week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              weekRange === 'last_week'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Chart 1: Trips Completed & Delays */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Trips Completed vs. Delayed</h3>
              <p className="text-[11px] text-slate-500">Daily trip volume (Mon–Fri)</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                <span>Completed</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                <span>Delayed</span>
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    backgroundColor: '#0B1324',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="tripsCompleted" name="Completed Trips" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delayedTrips" name="Delayed Trips" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Average Journey Duration */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-800">
                Average Journey Duration & On-Time %
              </h3>
              <p className="text-[11px] text-slate-500">Minutes per route vs. schedule adherence</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              Target ≤ 36 min
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  domain={[25, 45]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  hide
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1324',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgDurationMin"
                  name="Avg Duration (min)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#059669', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="onTimePct"
                  name="On-Time Rate (%)"
                  stroke="#2563EB"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
