import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import type { AttendanceStatus, BusStatus, DriverStatus, TripStatus } from '../../types/transportation';

type SemanticTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface StatusConfig {
  label: string;
  tone: SemanticTone;
  Icon: React.ComponentType<{ className?: string }>;
}

const TONE_CLASSES: Record<SemanticTone, string> = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-rose-700',
  neutral: 'text-slate-500',
  info: 'text-blue-700',
};

export const BusStatusIndicator: React.FC<{ status: BusStatus; delayMinutes?: number }> = ({
  status,
  delayMinutes = 0,
}) => {
  const map: Record<BusStatus, StatusConfig> = {
    active: { label: 'Active', tone: 'success', Icon: CheckCircle2 },
    delayed: {
      label: delayMinutes > 0 ? `Delayed +${delayMinutes}m` : 'Delayed',
      tone: 'warning',
      Icon: AlertTriangle,
    },
    idle: { label: 'Idle', tone: 'neutral', Icon: PauseCircle },
  };

  const { label, tone, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap tabular-nums ${TONE_CLASSES[tone]}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const TripStatusIndicator: React.FC<{ status: TripStatus; delayMinutes?: number }> = ({
  status,
  delayMinutes = 0,
}) => {
  const map: Record<TripStatus, StatusConfig> = {
    on_schedule: { label: 'On Schedule', tone: 'success', Icon: CheckCircle2 },
    delayed: {
      label: delayMinutes > 0 ? `Delayed +${delayMinutes}m` : 'Delayed',
      tone: 'warning',
      Icon: AlertTriangle,
    },
    completed: { label: 'Completed', tone: 'info', Icon: CheckCircle2 },
    scheduled: { label: 'Scheduled', tone: 'neutral', Icon: Clock },
  };

  const { label, tone, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap tabular-nums ${TONE_CLASSES[tone]}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const DriverStatusIndicator: React.FC<{ status: DriverStatus }> = ({ status }) => {
  const map: Record<DriverStatus, StatusConfig> = {
    on_duty: { label: 'On Duty', tone: 'success', Icon: CheckCircle2 },
    available: { label: 'Available', tone: 'info', Icon: Clock },
    off_duty: { label: 'Off Duty', tone: 'neutral', Icon: PauseCircle },
  };

  const { label, tone, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const AttendanceStatusIndicator: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  const map: Record<AttendanceStatus, StatusConfig> = {
    boarded: { label: 'Boarded', tone: 'success', Icon: CheckCircle2 },
    dropped_off: { label: 'Dropped Off', tone: 'info', Icon: CheckCircle2 },
    absent: { label: 'Absent', tone: 'danger', Icon: XCircle },
    pending: { label: 'Pending', tone: 'warning', Icon: Clock },
  };

  const { label, tone, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
