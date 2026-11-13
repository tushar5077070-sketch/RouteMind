import React, { useMemo, useState } from 'react';
import { ArrowUpDown, RefreshCw, Search } from 'lucide-react';
import { useRouteMind } from '../context/RouteMindContext';
import { BusStatusIndicator } from '../components/common/StatusIndicator';
import { EmptyState } from '../components/common/EmptyState';
import type { BusStatus } from '../types/transportation';

type SortField = 'busNumber' | 'driverName' | 'routeName' | 'status' | 'estimatedArrival';

export const LiveFleetPage: React.FC = () => {
  const { buses, openBusDrawer, simulateTelemetryTick } = useRouteMind();
  const [statusFilter, setStatusFilter] = useState<'all' | BusStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('busNumber');
  const [sortAsc, setSortAsc] = useState(true);

  const counts = useMemo(
    () => ({
      all: buses.length,
      active: buses.filter((b) => b.status === 'active').length,
      delayed: buses.filter((b) => b.status === 'delayed').length,
      idle: buses.filter((b) => b.status === 'idle').length,
    }),
    [buses]
  );

  const filteredBuses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = buses.filter((bus) => {
      if (statusFilter !== 'all' && bus.status !== statusFilter) return false;
      if (!q) return true;
      return (
        bus.busNumber.toLowerCase().includes(q) ||
        bus.registrationNumber.toLowerCase().includes(q) ||
        bus.driverName.toLowerCase().includes(q) ||
        bus.routeName.toLowerCase().includes(q) ||
        bus.currentLocationLabel.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
  }, [buses, statusFilter, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
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
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: `All buses (${counts.all})` },
                { id: 'active', label: `Active (${counts.active})` },
                { id: 'delayed', label: `Delayed (${counts.delayed})` },
                { id: 'idle', label: `Idle (${counts.idle})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 px-2">
            Simulated vehicle state · Select a row to inspect
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bus, plate, driver, route..."
              aria-label="Filter fleet list"
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={simulateTelemetryTick}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Demo</span>
          </button>
        </div>
      </div>

      {/* Fleet Table */}
      {filteredBuses.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('busNumber')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Bus & Registration</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('driverName')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Driver</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('routeName')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Assigned Route</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('status')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Trip Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Riders</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('estimatedArrival')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Est. Arrival</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBuses.map((bus) => (
                  <tr
                    key={bus.id}
                    onClick={() => openBusDrawer(bus.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{bus.busNumber}</p>
                      <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {bus.registrationNumber}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{bus.driverName}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">{bus.driverPhone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{bus.routeName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {bus.currentLocationLabel}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <BusStatusIndicator status={bus.status} delayMinutes={bus.delayMinutes} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      {bus.currentPassengers}/{bus.capacity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {bus.estimatedArrival}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                      {bus.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No matching buses found"
          description="Try clearing your search query or switching the fleet status filter back to All buses."
          actionLabel="Reset Filters"
          onAction={() => {
            setStatusFilter('all');
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};
