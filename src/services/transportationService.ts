import type { BaselineEtaInput, BaselineEtaResult } from '../types/transportation';

/**
 * Transparent deterministic baseline ETA formula.
 * Replaces opaque "AI" claims with inspectable arithmetic:
 *   effectiveSpeed = max(5, averageSpeedMph * trafficFactor)
 *   travelMinutes  = (remainingDistanceMiles / effectiveSpeed) * 60
 *   dwellMinutes   = (remainingStops * dwellSecondsPerStop) / 60
 *   totalMinutes   = round(travelMinutes + dwellMinutes)
 */
export function calculateBaselineEta(input: BaselineEtaInput): BaselineEtaResult {
  const safeDistance = Math.max(0, input.remainingDistanceMiles);
  const safeFactor = Math.max(0.25, Math.min(1.5, input.trafficFactor));
  const effectiveSpeedMph = Math.max(5, Number((input.averageSpeedMph * safeFactor).toFixed(1)));
  const travelMinutes = safeDistance > 0 ? (safeDistance / effectiveSpeedMph) * 60 : 0;
  const dwellMinutes = Math.max(0, input.remainingStops) * (Math.max(0, input.dwellSecondsPerStop) / 60);
  const totalMinutes = Math.round(travelMinutes + dwellMinutes);

  const arrivalTotalMinutes = input.currentTimeMinutes + totalMinutes;
  const hours24 = Math.floor(arrivalTotalMinutes / 60) % 24;
  const mins = arrivalTotalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return {
    travelMinutes: Number(travelMinutes.toFixed(1)),
    dwellMinutes: Number(dwellMinutes.toFixed(1)),
    totalMinutes,
    formattedEta: `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`,
    effectiveSpeedMph,
  };
}

/**
 * Parses a clock string like "08:01 AM" into minutes since midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 8 * 60 + 1;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Generates and downloads a RFC-4180 compliant CSV file client-side.
 */
export function downloadCsvFile(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (value: string | number) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Backend Integration Adapter Blueprint
 * -------------------------------------
 * RouteMind currently stores state in React Context backed by local demo data.
 * To connect Firebase Firestore or a Node.js/Express API:
 *   1. Implement TransportationRepository methods below (fetchBuses, subscribeToFleet, updateAttendance).
 *   2. Swap the initial state hydration in RouteMindContext with async repository hooks.
 */
export interface TransportationRepository {
  sourceName: 'local_demo' | 'firebase_firestore' | 'nodejs_rest';
  isConnected: boolean;
}

export const ACTIVE_REPOSITORY_INFO: TransportationRepository = {
  sourceName: 'local_demo',
  isConnected: false,
};
