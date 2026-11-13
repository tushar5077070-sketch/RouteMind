import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Bus as BusIcon, Mail, Phone, Search, ShieldCheck, X } from 'lucide-react';
import { useRouteMind } from '../context/RouteMindContext';
import { DriverStatusIndicator } from '../components/common/StatusIndicator';
import { EmptyState } from '../components/common/EmptyState';
import type { Driver, DriverStatus } from '../types/transportation';

type DriverSortField = 'employeeCode' | 'name' | 'status' | 'onTimeRatePct' | 'yearsOfService';

export const DriversPage: React.FC = () => {
  const { drivers, openBusDrawer } = useRouteMind();
  const [statusFilter, setStatusFilter] = useState<'all' | DriverStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<DriverSortField>('employeeCode');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const filteredDrivers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = drivers.filter((drv) => {
      if (statusFilter !== 'all' && drv.status !== statusFilter) return false;
      if (!q) return true;
      return (
        drv.name.toLowerCase().includes(q) ||
        drv.employeeCode.toLowerCase().includes(q) ||
        drv.licenseNumber.toLowerCase().includes(q) ||
        (drv.assignedBusNumber ?? '').toLowerCase().includes(q) ||
        (drv.currentRouteName ?? '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
  }, [drivers, statusFilter, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: DriverSortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {(
            [
              { id: 'all', label: `All (${drivers.length})` },
              { id: 'on_duty', label: 'On Duty' },
              { id: 'available', label: 'Available' },
              { id: 'off_duty', label: 'Off Duty' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver, CDL, bus, route..."
            aria-label="Search drivers"
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* Drivers Table */}
      {filteredDrivers.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('employeeCode')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Operator ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Driver</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Assigned Bus & Route</th>
                  <th className="py-3 px-4">CDL License</th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('status')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Duty Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('onTimeRatePct')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>On-Time Rate</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('yearsOfService')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Tenure</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDrivers.map((drv) => (
                  <tr
                    key={drv.id}
                    onClick={() => setSelectedDriver(drv)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                      {drv.employeeCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{drv.name}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">{drv.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">
                        {drv.assignedBusNumber ?? 'Unassigned'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {drv.currentRouteName ?? 'Standby'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-700 tabular-nums">{drv.licenseNumber}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        Exp {drv.licenseExpiry}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <DriverStatusIndicator status={drv.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {drv.onTimeRatePct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {drv.yearsOfService} yrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No drivers found"
          description="Try clearing the search query or selecting All duty statuses."
          actionLabel="Reset Filters"
          onAction={() => {
            setStatusFilter('all');
            setSearchQuery('');
          }}
        />
      )}

      {/* Driver Profile Drawer */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-[1px]"
            onClick={() => setSelectedDriver(null)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-slate-500">{selectedDriver.employeeCode}</p>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  {selectedDriver.name}
                </h2>
                <div className="mt-1">
                  <DriverStatusIndicator status={selectedDriver.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                aria-label="Close driver profile"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-3 tabular-nums">
                <div className="p-3.5 border border-slate-200 rounded-lg">
                  <p className="text-slate-500">On-Time Performance</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {selectedDriver.onTimeRatePct.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3.5 border border-slate-200 rounded-lg">
                  <p className="text-slate-500">Safety Compliance</p>
                  <p className="text-lg font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{selectedDriver.safetyScore}/100</span>
                  </p>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg space-y-2.5">
                <p className="font-semibold text-slate-900">Contact & Certification</p>
                <div className="flex items-center gap-2 text-slate-700 tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedDriver.email}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-600 tabular-nums">
                  <span>CDL Class B w/ P&amp;S Endorsement</span>
                  <span className="font-mono">{selectedDriver.licenseNumber}</span>
                </div>
              </div>

              {selectedDriver.assignedBusId && (
                <button
                  type="button"
                  onClick={() => {
                    const busId = selectedDriver.assignedBusId!;
                    setSelectedDriver(null);
                    openBusDrawer(busId);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <BusIcon className="w-4 h-4" />
                  <span>Inspect {selectedDriver.assignedBusNumber}</span>
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
