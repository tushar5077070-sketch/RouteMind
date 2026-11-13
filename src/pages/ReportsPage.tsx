import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import {
  DELAY_CAUSES_BREAKDOWN,
  SCHOOL_PERFORMANCE_REPORT,
} from '../data/demoData';
import { useRouteMind } from '../context/RouteMindContext';
import { downloadCsvFile } from '../services/transportationService';

export const ReportsPage: React.FC = () => {
  const { routes, buses, totalEnrolledStudents, pushToast } = useRouteMind();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'semester'>('weekly');

  const multiplier = period === 'weekly' ? 1 : period === 'monthly' ? 4 : 16;

  const handleExportReport = () => {
    downloadCsvFile(
      `routemind-district-report-${period}.csv`,
      ['School', 'Enrolled Students', 'On-Time Rate (%)', 'Avg Delay (min)'],
      SCHOOL_PERFORMANCE_REPORT.map((row) => [
        row.school,
        row.enrolledStudents,
        row.onTimePct,
        row.avgDelayMin,
      ])
    );
    pushToast(`Exported ${period} school transportation report CSV.`, 'success');
  };

  const avgFleetLoadPct = Math.round(
    (buses.filter((b) => b.status !== 'idle').reduce((acc, b) => acc + b.currentPassengers / b.capacity, 0) /
      Math.max(1, buses.filter((b) => b.status !== 'idle').length)) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(
            [
              { id: 'weekly', label: 'Current Week' },
              { id: 'monthly', label: '30-Day Window' },
              { id: 'semester', label: 'Fall Semester' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                period === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Scheduled Trips ({period})</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
            {routes.length * 5 * multiplier}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Simulated historical rollup</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">District On-Time Adherence</p>
          <p className="text-2xl font-semibold text-emerald-700 mt-1 tabular-nums">93.5%</p>
          <p className="text-[11px] text-slate-500 mt-1">Target benchmark ≥ 92.0%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Active Fleet Capacity Load</p>
          <p className="text-2xl font-semibold text-blue-700 mt-1 tabular-nums">
            {avgFleetLoadPct}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{totalEnrolledStudents} enrolled riders</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Recorded Delay Incidents</p>
          <p className="text-2xl font-semibold text-amber-700 mt-1 tabular-nums">
            {32 * multiplier}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Mean variance 3.6 min</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              On-Time Performance by Campus
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Arrival punctuality (%) across district campuses
            </p>
          </div>
          <div className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={SCHOOL_PERFORMANCE_REPORT}
                  margin={{ top: 8, right: 16, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="school"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[80, 100]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
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
                  <Bar
                    dataKey="onTimePct"
                    name="On-Time (%)"
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Delay Cause Distribution</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged variance categories ({period} demo summary)
            </p>
          </div>
          <div className="p-5 space-y-4">
            {DELAY_CAUSES_BREAKDOWN.map((item) => (
              <div key={item.cause} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{item.cause}</span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {item.count * multiplier} ({item.sharePct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${item.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Campus Summary Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Campus Transportation Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">School Campus</th>
                <th className="py-3 px-4 text-right">Enrolled Riders</th>
                <th className="py-3 px-4 text-right">On-Time Adherence</th>
                <th className="py-3 px-4 text-right">Avg Delay Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCHOOL_PERFORMANCE_REPORT.map((row) => (
                <tr key={row.school} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.school}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {row.enrolledStudents}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-emerald-700 tabular-nums">
                    {row.onTimePct}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    +{row.avgDelayMin} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
