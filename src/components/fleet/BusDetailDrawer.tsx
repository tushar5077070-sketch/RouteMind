import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  MapPin,
  Phone,
  Route as RouteIcon,
  Users,
  X,
} from 'lucide-react';
import { useRouteMind } from '../../context/RouteMindContext';
import { calculateBaselineEta, parseTimeToMinutes } from '../../services/transportationService';
import { BusStatusIndicator } from '../common/StatusIndicator';

export const BusDetailDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { selectedBus, closeBusDrawer, routes, settings, updateBusStatus } = useRouteMind();

  if (!selectedBus) return null;

  const assignedRoute = routes.find((r) => r.id === selectedBus.routeId);
  const etaCalc = calculateBaselineEta({
    remainingDistanceMiles: selectedBus.remainingDistanceMiles,
    averageSpeedMph: selectedBus.speedMph || 24,
    remainingStops: selectedBus.remainingStops,
    dwellSecondsPerStop: settings.defaultDwellSecondsPerStop,
    trafficFactor: selectedBus.status === 'delayed' ? 0.75 : 1.0,
    currentTimeMinutes: parseTimeToMinutes(selectedBus.lastUpdated),
  });

  const occupancyPct = Math.round((selectedBus.currentPassengers / selectedBus.capacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/35 backdrop-blur-[1px]"
        onClick={closeBusDrawer}
        aria-hidden="true"
      />

      <aside
        aria-label={`${selectedBus.busNumber} details`}
        className="relative z-10 w-full max-w-lg bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-slate-900">{selectedBus.busNumber}</h2>
              <BusStatusIndicator
                status={selectedBus.status}
                delayMinutes={selectedBus.delayMinutes}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {selectedBus.registrationNumber} · {selectedBus.model}
            </p>
          </div>
          <button
            type="button"
            onClick={closeBusDrawer}
            aria-label="Close bus details"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Simulated Telemetry Notice */}
          <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between gap-2">
            <span>Simulated demo telemetry · Not live GPS</span>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
              Updated {selectedBus.lastUpdated}
            </span>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Gauge className="w-3.5 h-3.5" />
                <span>Speed</span>
              </div>
              <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                {selectedBus.speedMph} mph
              </p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>Onboard</span>
              </div>
              <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                {selectedBus.currentPassengers}/{selectedBus.capacity} ({occupancyPct}%)
              </p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Est. Arrival</span>
              </div>
              <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                {selectedBus.status === 'idle' ? 'Standby' : selectedBus.estimatedArrival}
              </p>
            </div>
          </div>

          {/* Driver & Location */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h3 className="text-xs font-semibold text-slate-900">Assignment & Position</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Assigned Driver</p>
                <p className="font-medium text-slate-900 mt-0.5">{selectedBus.driverName}</p>
                <p className="text-slate-500 mt-0.5 inline-flex items-center gap-1 tabular-nums">
                  <Phone className="w-3 h-3" />
                  <span>{selectedBus.driverPhone}</span>
                </p>
              </div>
              <div>
                <p className="text-slate-500">Assigned Route</p>
                <p className="font-medium text-slate-900 mt-0.5">{selectedBus.routeName}</p>
                <p className="text-slate-500 mt-0.5 tabular-nums">
                  {assignedRoute?.routeCode ?? selectedBus.routeId.toUpperCase()} ·{' '}
                  {assignedRoute?.school ?? 'Oakridge District'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500">Current Corridor (Simulated)</p>
                  <p className="font-medium text-slate-900">{selectedBus.currentLocationLabel}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RouteIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-500">Next Stop</p>
                  <p className="font-medium text-slate-900">{selectedBus.nextStop}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Baseline ETA Formula */}
          {selectedBus.status !== 'idle' && (
            <div className="space-y-2.5 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-900">
                  Baseline ETA Calculation Breakdown
                </h3>
                <span className="text-[11px] text-slate-500">Deterministic Formula</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-lg text-xs space-y-1.5 tabular-nums">
                <div className="flex justify-between text-slate-600">
                  <span>Remaining Distance</span>
                  <span className="font-mono text-slate-900">
                    {selectedBus.remainingDistanceMiles} mi
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Effective Sample Speed</span>
                  <span className="font-mono text-slate-900">{etaCalc.effectiveSpeedMph} mph</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Stop Dwell Allowance ({selectedBus.remainingStops} stops)</span>
                  <span className="font-mono text-slate-900">{etaCalc.dwellMinutes} min</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex justify-between font-semibold text-slate-900">
                  <span>Calculated Remaining Time</span>
                  <span className="font-mono">
                    {etaCalc.totalMinutes} min ({etaCalc.formattedEta})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Route Stops Timeline */}
          {assignedRoute && (
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <h3 className="text-xs font-semibold text-slate-900">Route Stops Progress</h3>
              <div className="space-y-2">
                {assignedRoute.stops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between py-2 px-3 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{stop.name}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {stop.studentsCount > 0 ? `${stop.studentsCount} students` : 'Final campus drop'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3 tabular-nums">
                      <p className="font-mono font-medium text-slate-900">{stop.estimatedTime}</p>
                      <p className="text-[11px] text-slate-400">Sched {stop.scheduledTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dispatch Status Controls */}
          <div className="space-y-2.5 border-t border-slate-100 pt-5">
            <h3 className="text-xs font-semibold text-slate-900">Dispatch Override Controls</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateBusStatus(selectedBus.id, 'active', 0)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 text-slate-700 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark On Schedule</span>
              </button>
              <button
                type="button"
                onClick={() => updateBusStatus(selectedBus.id, 'delayed', 10)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 text-slate-700 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Flag +10m Delay</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeBusDrawer();
                  navigate('/routes');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <span>Open Route Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
