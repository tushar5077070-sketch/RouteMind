import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Calculator, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { HOURLY_DELAY_PATTERNS } from '../data/demoData';
import { useRouteMind } from '../context/RouteMindContext';
import { calculateBaselineEta, parseTimeToMinutes } from '../services/transportationService';

export const IntelligencePage: React.FC = () => {
  const { buses, routes, insights, settings, acknowledgeInsight, openBusDrawer } = useRouteMind();

  // Interactive Transparent Baseline ETA Calculator state
  const [selectedBusForCalc, setSelectedBusForCalc] = useState<string>('bus-113');
  const activeBus = useMemo(
    () => buses.find((b) => b.id === selectedBusForCalc) ?? buses[0],
    [buses, selectedBusForCalc]
  );

  const [distanceMiles, setDistanceMiles] = useState<number>(3.4);
  const [speedMph, setSpeedMph] = useState<number>(15);
  const [remainingStops, setRemainingStops] = useState<number>(3);
  const [dwellSeconds, setDwellSeconds] = useState<number>(settings.defaultDwellSecondsPerStop);
  const [trafficFactor, setTrafficFactor] = useState<number>(0.85);

  const handleSelectBusPreset = (busId: string) => {
    setSelectedBusForCalc(busId);
    const bus = buses.find((b) => b.id === busId);
    if (bus) {
      setDistanceMiles(bus.remainingDistanceMiles || 2.0);
      setSpeedMph(bus.speedMph || 24);
      setRemainingStops(bus.remainingStops || 2);
      setTrafficFactor(bus.status === 'delayed' ? 0.8 : 1.0);
    }
  };

  const calcResult = useMemo(
    () =>
      calculateBaselineEta({
        remainingDistanceMiles: distanceMiles,
        averageSpeedMph: speedMph,
        remainingStops,
        dwellSecondsPerStop: dwellSeconds,
        trafficFactor,
        currentTimeMinutes: parseTimeToMinutes('08:01 AM'),
      }),
    [distanceMiles, speedMph, remainingStops, dwellSeconds, trafficFactor]
  );

  const activeRoutesComparison = useMemo(() => {
    return routes
      .filter((r) => r.status === 'on_schedule' || r.status === 'delayed')
      .slice(0, 8)
      .map((route) => {
        const baseline = calculateBaselineEta({
          remainingDistanceMiles: route.remainingDistanceMiles,
          averageSpeedMph: route.averageSpeedMph,
          remainingStops: route.stops.filter((s) => !s.completed).length,
          dwellSecondsPerStop: settings.defaultDwellSecondsPerStop,
          trafficFactor: route.status === 'delayed' ? 0.85 : 1.0,
          currentTimeMinutes: parseTimeToMinutes('08:01 AM'),
        });

        // Simulated ML benchmark adds +/- 1-3 min historical corridor offset (clearly labeled as demo benchmark)
        const mlSimulatedOffset = route.status === 'delayed' ? 2 : -1;
        const mlBenchmarkResult = calculateBaselineEta({
          remainingDistanceMiles: route.remainingDistanceMiles,
          averageSpeedMph: route.averageSpeedMph,
          remainingStops: route.stops.filter((s) => !s.completed).length,
          dwellSecondsPerStop: settings.defaultDwellSecondsPerStop,
          trafficFactor: route.status === 'delayed' ? 0.85 : 1.0,
          currentTimeMinutes: parseTimeToMinutes('08:01 AM') + mlSimulatedOffset,
        });

        return {
          route,
          baselineEta: baseline.formattedEta,
          baselineMinutes: baseline.totalMinutes,
          mlSimulatedEta: mlBenchmarkResult.formattedEta,
        };
      });
  }, [routes, settings.defaultDwellSecondsPerStop]);

  const sortedRouteScores = useMemo(
    () =>
      [...routes]
        .filter((r) => r.status !== 'scheduled')
        .sort((a, b) => a.onTimeScorePct - b.onTimeScorePct)
        .slice(0, 8),
    [routes]
  );

  return (
    <div className="space-y-6">
      {/* Transparency Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">
              Transparent Calculation & Demo Model Boundary:
            </span>{' '}
            Baseline ETAs below are computed deterministically from sample distance, speed, and
            stop dwell seconds. Simulated ML comparison columns represent placeholder benchmarks and
            do not call a live machine-learning model.
          </div>
        </div>
      </div>

      {/* Top Row: Interactive Baseline ETA Calculator + Historical Delay Patterns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Interactive Deterministic ETA Calculator */}
        <section className="xl:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Baseline ETA Formula Sandbox
                </h2>
                <p className="text-[11px] text-slate-500">
                  Inspectable arithmetic: (Distance / Effective Speed) + Stop Dwell Allowance
                </p>
              </div>
            </div>
            <select
              value={selectedBusForCalc}
              onChange={(e) => handleSelectBusPreset(e.target.value)}
              aria-label="Load bus parameters"
              className="h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              {buses
                .filter((b) => b.status !== 'idle')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} ({b.routeName})
                  </option>
                ))}
            </select>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Remaining Distance (mi)</span>
                  <span className="font-mono text-slate-900 tabular-nums">{distanceMiles} mi</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={distanceMiles}
                  onChange={(e) => setDistanceMiles( parseFloat(e.target.value) )}
                  className="w-full accent-blue-600"
                />
              </label>

              <label className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Corridor Speed (mph)</span>
                  <span className="font-mono text-slate-900 tabular-nums">{speedMph} mph</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={35}
                  step={1}
                  value={speedMph}
                  onChange={(e) => setSpeedMph(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </label>

              <label className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Remaining Stops</span>
                  <span className="font-mono text-slate-900 tabular-nums">{remainingStops}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={remainingStops}
                  onChange={(e) => setRemainingStops(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </label>

              <label className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-700">Traffic Factor</span>
                  <span className="font-mono text-slate-900 tabular-nums">
                    {trafficFactor.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.2}
                  step={0.05}
                  value={trafficFactor}
                  onChange={(e) => setTrafficFactor(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </label>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-600">Stop Dwell Time Assumption (seconds/stop):</span>
              <input
                type="number"
                min={15}
                max={180}
                value={dwellSeconds}
                onChange={(e) => setDwellSeconds(Math.max(0, Number(e.target.value)))}
                className="w-20 h-8 px-2 text-right font-mono bg-slate-50 border border-slate-200 rounded-md tabular-nums"
              />
            </div>

            {/* Deterministic Output Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
              <div>
                <p className="text-slate-500">Effective Speed</p>
                <p className="text-sm font-semibold text-slate-900 font-mono mt-0.5">
                  {calcResult.effectiveSpeedMph} mph
                </p>
              </div>
              <div>
                <p className="text-slate-500">Travel Time</p>
                <p className="text-sm font-semibold text-slate-900 font-mono mt-0.5">
                  {calcResult.travelMinutes} min
                </p>
              </div>
              <div>
                <p className="text-slate-500">Stop Dwell</p>
                <p className="text-sm font-semibold text-slate-900 font-mono mt-0.5">
                  {calcResult.dwellMinutes} min
                </p>
              </div>
              <div>
                <p className="text-slate-500">Calculated ETA</p>
                <p className="text-sm font-semibold text-blue-700 font-mono mt-0.5">
                  {calcResult.formattedEta} (+{calcResult.totalMinutes}m)
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Preset loaded from {activeBus.busNumber} ({activeBus.routeName}) · Scheduled arrival:{' '}
              <span className="font-mono text-slate-700">{activeBus.scheduledArrival}</span>
            </p>
          </div>
        </section>

        {/* Historical Delay Patterns Chart */}
        <section className="xl:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Historical Delay Patterns by Bell Window
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Average sample variance (minutes) across peak morning and afternoon runs
            </p>
          </div>
          <div className="p-5">
            <div className="h-[268px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={HOURLY_DELAY_PATTERNS}
                  margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit="m"
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
                    dataKey="avgDelayMin"
                    name="Avg Delay (min)"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      {/* Predicted Arrival Comparison Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Predicted Arrival Times · Baseline Formula vs. Demo Benchmark
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side view separating transparent deterministic math from conceptual ML estimates
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Bus</th>
                <th className="py-3 px-4 text-right">Remaining Dist.</th>
                <th className="py-3 px-4 text-right">Scheduled</th>
                <th className="py-3 px-4 text-right">Baseline Math ETA</th>
                <th className="py-3 px-4 text-right">Simulated ML Benchmark</th>
                <th className="py-3 px-4 text-right">Perf. Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRoutesComparison.map(({ route, baselineEta, baselineMinutes, mlSimulatedEta }) => (
                <tr
                  key={route.id}
                  onClick={() => openBusDrawer(route.assignedBusId)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">
                      {route.routeCode} · {route.routeName}
                    </p>
                    <p className="text-[11px] text-slate-500">{route.school}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{route.assignedBusNumber}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {route.remainingDistanceMiles} mi
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                    {route.scheduledArrival}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {baselineEta} ({baselineMinutes}m)
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700">
                    {mlSimulatedEta} (demo)
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <span
                      className={
                        route.onTimeScorePct < 85
                          ? 'text-amber-700 font-semibold'
                          : 'text-emerald-700 font-medium'
                      }
                    >
                      {route.onTimeScorePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Split: Unusual Journey Detection & Recommendations + Route Performance Scores */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Unusual Journey Detection & Administrative Recommendations
              </h2>
              <p className="text-[11px] text-slate-500">
                Sample anomaly rules with recommended dispatch actions
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {insights.map((ins) => (
              <div key={ins.id} className="p-5 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          ins.severity === 'critical'
                            ? 'text-rose-700'
                            : ins.severity === 'warning'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{ins.affectedRouteCode}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ins.affectedBusNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{ins.confidencePct}% demo confidence</span>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-900 mt-1">{ins.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ins.summary}</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Recommended Action: </span>
                  {ins.recommendation}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {ins.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recommendation Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => acknowledgeInsight(ins.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Acknowledge Recommendation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Route Performance Scores</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lowest-scoring routes prioritized for schedule review
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedRouteScores.map((rt) => (
              <div key={rt.id} className="px-5 py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {rt.routeCode} · {rt.routeName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {rt.assignedBusNumber} · {rt.driverName}
                  </p>
                </div>
                <div className="w-32 shrink-0">
                  <div className="flex items-center justify-between mb-1 tabular-nums">
                    <span className="text-[11px] text-slate-500">Score</span>
                    <span
                      className={`font-mono font-semibold ${
                        rt.onTimeScorePct < 85 ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {rt.onTimeScorePct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rt.onTimeScorePct < 85 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${rt.onTimeScorePct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
