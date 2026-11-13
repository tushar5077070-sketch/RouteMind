import React, { useEffect, useState } from 'react';
import { Database, RotateCcw, Save } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../data/demoData';
import { useRouteMind } from '../context/RouteMindContext';
import type { DistrictSettings } from '../types/transportation';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useRouteMind();
  const [form, setForm] = useState<DistrictSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* General District Settings */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">District & Dispatch Thresholds</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational parameters used for delay flags and baseline ETA calculations
          </p>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="font-medium text-slate-700 block">School District Name</span>
              <input
                type="text"
                value={form.districtName}
                onChange={(e) => setForm({ ...form, districtName: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="font-medium text-slate-700 block">Operations Timezone</span>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
              >
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="America/Denver (MST)">America/Denver (MST)</option>
                <option value="America/Chicago (CST)">America/Chicago (CST)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <label className="space-y-1.5">
              <span className="font-medium text-slate-700 block">
                Delay Alert Threshold (min)
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={form.delayAlertThresholdMin}
                onChange={(e) =>
                  setForm({ ...form, delayAlertThresholdMin: Number(e.target.value) })
                }
                className="w-full h-9 px-3 font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="font-medium text-slate-700 block">
                Default Stop Dwell (sec)
              </span>
              <input
                type="number"
                min={15}
                max={180}
                value={form.defaultDwellSecondsPerStop}
                onChange={(e) =>
                  setForm({ ...form, defaultDwellSecondsPerStop: Number(e.target.value) })
                }
                className="w-full h-9 px-3 font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </label>

            <label className="space-y-1.5">
              <span className="font-medium text-slate-700 block">
                School Zone Speed Cap (mph)
              </span>
              <input
                type="number"
                min={10}
                max={35}
                value={form.schoolZoneSpeedCapMph}
                onChange={(e) =>
                  setForm({ ...form, schoolZoneSpeedCapMph: Number(e.target.value) })
                }
                className="w-full h-9 px-3 font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Alert & Notification Toggles */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Alert Rules</h2>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <label className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium text-slate-900">Dispatch Delay Notifications</p>
              <p className="text-slate-500">
                Raise notification when a route exceeds the configured delay threshold
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.enableDelayNotifications}
              onChange={(e) => setForm({ ...form, enableDelayNotifications: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium text-slate-900">Unusual Stop Dwell Warnings</p>
              <p className="text-slate-500">
                Flag routes where stop boarding duration exceeds 2x historical baseline
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.enableUnusualDwellAlerts}
              onChange={(e) => setForm({ ...form, enableUnusualDwellAlerts: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-medium text-slate-900">Guardian Delay Digest (Demo Toggle)</p>
              <p className="text-slate-500">
                Preview state only — no external SMS gateway is connected in this demo build
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.enableParentSmsDigest}
              onChange={(e) => setForm({ ...form, enableParentSmsDigest: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>
        </div>
      </section>

      {/* Architecture Readiness */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Data Source & Backend Integration Readiness
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Currently running on deterministic local demo data in memory. TypeScript domain models
          and repository interfaces in <span className="font-mono text-slate-800">src/services</span>{' '}
          are structured for seamless connection to Firebase Firestore collections or a Node.js
          Express telemetry backend without UI refactoring.
        </p>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            setForm(DEFAULT_SETTINGS);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Dataset</span>
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>
    </form>
  );
};
