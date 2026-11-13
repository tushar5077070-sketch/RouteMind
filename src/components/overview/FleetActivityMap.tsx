import React, { useMemo, useState } from 'react';
import { RefreshCw, School, Warehouse } from 'lucide-react';
import { DISTRICT_LANDMARKS } from '../../data/demoData';
import { useRouteMind } from '../../context/RouteMindContext';
import type { BusStatus } from '../../types/transportation';

export const FleetActivityMap: React.FC = () => {
  const { buses, selectedBusId, openBusDrawer, simulateTelemetryTick } = useRouteMind();
  const [statusFilter, setStatusFilter] = useState<'all' | BusStatus>('all');

  const visibleBuses = useMemo(
    () =>
      statusFilter === 'all' ? buses : buses.filter((b) => b.status === statusFilter),
    [buses, statusFilter]
  );

  const counts = useMemo(
    () => ({
      all: buses.length,
      active: buses.filter((b) => b.status === 'active').length,
      delayed: buses.filter((b) => b.status === 'delayed').length,
      idle: buses.filter((b) => b.status === 'idle').length,
    }),
    [buses]
  );

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Fleet Activity Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated demo coordinates across Oakridge school corridors · Select any vehicle to inspect
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'active', 'delayed', 'idle'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                  statusFilter === key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {key === 'all'
                  ? `All (${counts.all})`
                  : key === 'active'
                    ? `Active (${counts.active})`
                    : key === 'delayed'
                      ? `Delayed (${counts.delayed})`
                      : `Idle (${counts.idle})`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={simulateTelemetryTick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Step Demo</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Map Surface */}
      <div className="relative bg-[#F4F7FB] h-[360px] sm:h-[400px] w-full overflow-hidden">
        <svg
          viewBox="0 0 1000 580"
          className="w-full h-full select-none"
          role="img"
          aria-label="Simulated district school bus fleet map"
        >
          <defs>
            <pattern id="rm-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>

          {/* Subtle District Grid */}
          <rect width="1000" height="580" fill="url(#rm-grid)" />

          {/* Simulated District Water / Greenbelt Features */}
          <path
            d="M 0 330 Q 210 295 450 325 T 1000 285 L 1000 315 Q 740 345 450 355 T 0 360 Z"
            fill="#E0F2FE"
            opacity="0.7"
          />

          {/* Major Arterial Road Corridors */}
          <g stroke="#CBD5E1" strokeLinecap="round" fill="none">
            <path d="M 80 120 L 510 260 L 760 175 L 920 140" strokeWidth="6" />
            <path d="M 135 115 L 295 390 L 745 455 L 910 510" strokeWidth="6" />
            <path d="M 295 390 L 510 260 L 745 455" strokeWidth="5" />
            <path d="M 510 60 L 510 530" strokeWidth="5" />
            <path d="M 120 260 L 890 260" strokeWidth="4" strokeDasharray="8 6" />
          </g>

          {/* Highway 9 Crossing Highlight */}
          <line
            x1="440"
            y1="355"
            x2="495"
            y2="395"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Campus & Depot Landmarks */}
          {DISTRICT_LANDMARKS.map((lm) => (
            <g key={lm.id} transform={`translate(${lm.x}, ${lm.y})`}>
              <rect
                x="-12"
                y="-12"
                width="24"
                height="24"
                rx="6"
                fill={lm.kind === 'depot' ? '#0B1324' : '#FFFFFF'}
                stroke={lm.kind === 'depot' ? '#0B1324' : '#94A3B8'}
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="24"
                textAnchor="middle"
                className="fill-slate-600 text-[11px] font-medium"
              >
                {lm.name}
              </text>
            </g>
          ))}

          {/* Interactive Bus Markers */}
          {visibleBuses.map((bus) => {
            const isSelected = bus.id === selectedBusId;
            const fill =
              bus.status === 'active'
                ? '#059669'
                : bus.status === 'delayed'
                  ? '#D97706'
                  : '#64748B';
            const ring =
              bus.status === 'active'
                ? '#A7F3D0'
                : bus.status === 'delayed'
                  ? '#FDE68A'
                  : '#CBD5E1';

            const shortLabel = bus.busNumber.replace('Bus ', '');

            return (
              <g
                key={bus.id}
                transform={`translate(${bus.mapCoords.x}, ${bus.mapCoords.y})`}
                onClick={() => openBusDrawer(bus.id)}
                role="button"
                tabIndex={0}
                aria-label={`${bus.busNumber}, ${bus.status}, ${bus.routeName}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openBusDrawer(bus.id);
                  }
                }}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle r="22" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                )}
                <circle r="15" fill={ring} opacity="0.55" />
                <circle
                  r="11"
                  fill={fill}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-transform duration-150 group-hover:scale-110"
                />
                <text
                  y="3.5"
                  textAnchor="middle"
                  className="fill-white text-[9px] font-mono font-semibold pointer-events-none"
                >
                  {shortLabel}
                </text>
                <title>
                  {`${bus.busNumber} (${bus.status.toUpperCase()}) · ${bus.routeName} · ${bus.currentLocationLabel}`}
                </title>
              </g>
            );
          })}
        </svg>

        {/* Map Legend & Simulated Data Disclosure */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg text-[11px] text-slate-700 shadow-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Active</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>Delayed</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Idle / Depot</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 border-l border-slate-200 pl-3">
              <School className="w-3 h-3" />
              <span>Campuses</span>
              <span aria-hidden="true">·</span>
              <Warehouse className="w-3 h-3" />
              <span>Depot</span>
            </span>
          </div>

          <div className="px-2.5 py-1 bg-slate-900/85 text-white rounded-md text-[11px] font-medium">
            Simulated Demo Locations · Not Live GPS
          </div>
        </div>
      </div>
    </section>
  );
};
