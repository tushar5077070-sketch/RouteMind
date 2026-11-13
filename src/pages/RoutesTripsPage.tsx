import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Bus as BusIcon, Search, X } from 'lucide-react';
import { useRouteMind } from '../context/RouteMindContext';
import { TripStatusIndicator } from '../components/common/StatusIndicator';
import { EmptyState } from '../components/common/EmptyState';
import type { RouteTrip, TripStatus } from '../types/transportation';

type RouteSortField =
  | 'routeCode'
  | 'routeName'
  | 'assignedBusNumber'
  | 'studentCount'
  | 'scheduledDeparture'
  | 'estimatedArrival'
  | 'status';

export const RoutesTripsPage: React.FC = () => {
  const { routes, openBusDrawer } = useRouteMind();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TripStatus>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<RouteSortField>('routeCode');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteTrip | null>(null);

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = routes.filter((rt) => {
      if (statusFilter !== 'all' && rt.status !== statusFilter) return false;
      if (shiftFilter !== 'all' && rt.shift !== shiftFilter) return false;
      if (!q) return true;
      return (
        rt.routeCode.toLowerCase().includes(q) ||
        rt.routeName.toLowerCase().includes(q) ||
        rt.assignedBusNumber.toLowerCase().includes(q) ||
        rt.driverName.toLowerCase().includes(q) ||
        rt.school.toLowerCase().includes(q)
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
  }, [routes, searchQuery, statusFilter, shiftFilter, sortField, sortAsc]);

  const toggleSort = (field: RouteSortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: 'all', label: `All (${routes.length})` },
                { id: 'on_schedule', label: 'On Schedule' },
                { id: 'delayed', label: 'Delayed' },
                { id: 'completed', label: 'Completed' },
                { id: 'scheduled', label: 'Scheduled' },
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
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            aria-label="Filter by trip shift"
            className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Shifts</option>
            <option value="Morning Pickup">Morning Pickup</option>
            <option value="Midday Shuttle">Midday Shuttle</option>
            <option value="Afternoon Drop-off">Afternoon Drop-off</option>
          </select>
        </div>

        <div className="relative w-full xl:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search route ID, name, school, driver..."
            aria-label="Search routes and trips"
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* Routes Table */}
      {filteredRoutes.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('routeCode')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Route ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('routeName')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Route Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('assignedBusNumber')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Assigned Bus</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('studentCount')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Students</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('scheduledDeparture')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Sched. Departure</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
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
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('status')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoutes.map((route) => (
                  <tr
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                      {route.routeCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{route.routeName}</p>
                      <p className="text-[11px] text-slate-500">
                        {route.school} · {route.shift}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {route.assignedBusNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{route.driverName}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      {route.studentCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      {route.scheduledDeparture}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {route.estimatedArrival}
                    </td>
                    <td className="py-3 px-4">
                      <TripStatusIndicator
                        status={route.status}
                        delayMinutes={route.delayMinutes}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No routes match your filters"
          description="Adjust your status, shift, or search filter to view scheduled and active trips."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setShiftFilter('all');
          }}
        />
      )}

      {/* Route Detail Side Drawer */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-[1px]"
            onClick={() => setSelectedRoute(null)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-600">
                    {selectedRoute.routeCode}
                  </span>
                  <TripStatusIndicator
                    status={selectedRoute.status}
                    delayMinutes={selectedRoute.delayMinutes}
                  />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  {selectedRoute.routeName}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedRoute.school} · {selectedRoute.shift}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                aria-label="Close route detail"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-lg">
                  <p className="text-slate-500">Assigned Bus & Driver</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedRoute.assignedBusNumber}
                  </p>
                  <p className="text-slate-600">{selectedRoute.driverName}</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg tabular-nums">
                  <p className="text-slate-500">Distance & Students</p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {selectedRoute.distanceMiles.toFixed(1)} mi total
                  </p>
                  <p className="text-slate-600">{selectedRoute.studentCount} assigned riders</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-900">Stop-by-Stop Timetable</h3>
                <div className="space-y-2">
                  {selectedRoute.stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="p-3 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {idx + 1}. {stop.name}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {stop.studentsCount > 0
                            ? `${stop.studentsCount} riders scheduled`
                            : 'Destination campus'}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3 tabular-nums">
                        <p className="font-mono font-semibold text-slate-900">
                          {stop.estimatedTime}
                        </p>
                        <p className="text-[11px] text-slate-400">Sched {stop.scheduledTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const busId = selectedRoute.assignedBusId;
                  setSelectedRoute(null);
                  openBusDrawer(busId);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <BusIcon className="w-4 h-4" />
                <span>Inspect Assigned Bus ({selectedRoute.assignedBusNumber})</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
