import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useRouteMind } from '../context/RouteMindContext';
import { AttendanceStatusIndicator } from '../components/common/StatusIndicator';
import { EmptyState } from '../components/common/EmptyState';
import { downloadCsvFile } from '../services/transportationService';
import type { AttendanceStatus } from '../types/transportation';

export const AttendancePage: React.FC = () => {
  const { attendance, selectedDate, updateAttendanceStatus, pushToast } = useRouteMind();
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const routeCodes = useMemo(
    () => Array.from(new Set(attendance.map((a) => a.routeCode))).sort(),
    [attendance]
  );

  const summary = useMemo(
    () => ({
      boarded: attendance.filter((a) => a.status === 'boarded').length,
      droppedOff: attendance.filter((a) => a.status === 'dropped_off').length,
      pending: attendance.filter((a) => a.status === 'pending').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
    }),
    [attendance]
  );

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return attendance.filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (routeFilter !== 'all' && rec.routeCode !== routeFilter) return false;
      if (!q) return true;
      return (
        rec.studentName.toLowerCase().includes(q) ||
        rec.studentCode.toLowerCase().includes(q) ||
        rec.routeCode.toLowerCase().includes(q) ||
        rec.stopName.toLowerCase().includes(q)
      );
    });
  }, [attendance, statusFilter, routeFilter, searchQuery]);

  const handleExportCsv = () => {
    downloadCsvFile(
      `routemind-attendance-${selectedDate}.csv`,
      ['Student ID', 'Student Name', 'School', 'Route', 'Bus', 'Stop', 'Status', 'Timestamp'],
      filteredRecords.map((r) => [
        r.studentCode,
        r.studentName,
        r.school,
        r.routeCode,
        r.busNumber,
        r.stopName,
        r.status,
        r.timestamp ?? '—',
      ])
    );
    pushToast('Exported attendance log CSV.', 'success');
  };

  return (
    <div className="space-y-5">
      {/* Live Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Boarded (Sample Roster)</p>
          <p className="text-2xl font-semibold text-emerald-700 mt-1 tabular-nums">
            {summary.boarded}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Dropped Off (Early AM)</p>
          <p className="text-2xl font-semibold text-blue-700 mt-1 tabular-nums">
            {summary.droppedOff}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Pending Stop Pickup</p>
          <p className="text-2xl font-semibold text-amber-700 mt-1 tabular-nums">
            {summary.pending}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Marked Absent</p>
          <p className="text-2xl font-semibold text-rose-700 mt-1 tabular-nums">
            {summary.absent}
          </p>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'boarded', label: 'Boarded' },
                { id: 'dropped_off', label: 'Dropped Off' },
                { id: 'pending', label: 'Pending' },
                { id: 'absent', label: 'Absent' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            aria-label="Filter attendance by route"
            className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Routes</option>
            {routeCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or stop..."
              aria-label="Search attendance logs"
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      {filteredRecords.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Route & Bus</th>
                  <th className="py-3 px-4">Stop</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Scan Time</th>
                  <th className="py-3 px-4 text-right">Update Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{rec.studentName}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {rec.studentCode} · {rec.school}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{rec.routeCode}</p>
                      <p className="text-[11px] text-slate-500">{rec.busNumber}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{rec.stopName}</td>
                    <td className="py-3 px-4">
                      <AttendanceStatusIndicator status={rec.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {rec.timestamp ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateAttendanceStatus(rec.id, 'boarded')}
                          className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                            rec.status === 'boarded'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Boarded
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttendanceStatus(rec.id, 'dropped_off')}
                          className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                            rec.status === 'dropped_off'
                              ? 'bg-blue-50 border-blue-200 text-blue-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Dropped
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAttendanceStatus(rec.id, 'absent')}
                          className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                            rec.status === 'absent'
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No attendance records match your filters"
          description="Adjust the status, route, or search term to inspect student boarding logs."
          actionLabel="Reset Filters"
          onAction={() => {
            setStatusFilter('all');
            setRouteFilter('all');
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};
