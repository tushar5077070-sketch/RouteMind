export type BusStatus = 'active' | 'delayed' | 'idle';

export type TripStatus = 'on_schedule' | 'delayed' | 'completed' | 'scheduled';

export type DriverStatus = 'on_duty' | 'available' | 'off_duty';

export type AttendanceStatus = 'boarded' | 'dropped_off' | 'absent' | 'pending';

export type ActivityEventType =
  | 'student_boarded'
  | 'trip_started'
  | 'delay_detected'
  | 'trip_completed';

export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface RouteStop {
  id: string;
  name: string;
  scheduledTime: string;
  estimatedTime: string;
  studentsCount: number;
  completed: boolean;
}

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  model: string;
  capacity: number;
  currentPassengers: number;
  status: BusStatus;
  driverId: string;
  driverName: string;
  driverPhone: string;
  routeId: string;
  routeName: string;
  currentLocationLabel: string;
  nextStop: string;
  /** Simulated 2D canvas coordinates (0–1000 x 0–600) for district map visualization */
  mapCoords: { x: number; y: number };
  headingDeg: number;
  speedMph: number;
  remainingDistanceMiles: number;
  remainingStops: number;
  delayMinutes: number;
  scheduledArrival: string;
  estimatedArrival: string;
  lastUpdated: string;
  fuelOrChargePct: number;
}

export interface Driver {
  id: string;
  name: string;
  employeeCode: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  assignedBusId: string | null;
  assignedBusNumber: string | null;
  currentRouteName: string | null;
  onTimeRatePct: number;
  yearsOfService: number;
  safetyScore: number;
  completedTripsThisWeek: number;
}

export interface RouteTrip {
  id: string;
  routeCode: string;
  routeName: string;
  school: string;
  shift: 'Morning Pickup' | 'Afternoon Drop-off' | 'Midday Shuttle';
  date: string;
  assignedBusId: string;
  assignedBusNumber: string;
  driverId: string;
  driverName: string;
  studentCount: number;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedArrival: string;
  status: TripStatus;
  delayMinutes: number;
  distanceMiles: number;
  remainingDistanceMiles: number;
  averageSpeedMph: number;
  onTimeScorePct: number;
  stops: RouteStop[];
}

export interface Student {
  id: string;
  studentCode: string;
  name: string;
  grade: string;
  school: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  stopName: string;
  guardianName: string;
  guardianPhone: string;
  todayStatus: AttendanceStatus;
  lastBoardedAt: string | null;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  grade: string;
  school: string;
  routeId: string;
  routeCode: string;
  busNumber: string;
  stopName: string;
  date: string;
  shift: 'Morning Pickup' | 'Afternoon Drop-off';
  status: AttendanceStatus;
  timestamp: string | null;
  recordedBy: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  busNumber?: string;
  routeCode?: string;
  timestamp: string;
  relativeTime: string;
}

export interface OperationalInsight {
  id: string;
  category: 'delay_prediction' | 'route_performance' | 'unusual_pattern';
  severity: InsightSeverity;
  title: string;
  summary: string;
  explanation: string;
  recommendation: string;
  confidencePct: number;
  basisLabel: string;
  affectedRouteCode: string;
  affectedBusNumber: string;
  acknowledged: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: InsightSeverity;
  timestamp: string;
  read: boolean;
  targetPath: string;
}

export interface WeeklyAnalyticsPoint {
  day: string;
  tripsCompleted: number;
  delayedTrips: number;
  avgDurationMin: number;
  onTimePct: number;
}

export interface HourlyDelayPatternPoint {
  hour: string;
  avgDelayMin: number;
  historicalIncidents: number;
}

export interface BaselineEtaInput {
  remainingDistanceMiles: number;
  averageSpeedMph: number;
  remainingStops: number;
  dwellSecondsPerStop: number;
  trafficFactor: number;
  currentTimeMinutes: number;
}

export interface BaselineEtaResult {
  travelMinutes: number;
  dwellMinutes: number;
  totalMinutes: number;
  formattedEta: string;
  effectiveSpeedMph: number;
}

export interface DistrictSettings {
  districtName: string;
  timezone: string;
  delayAlertThresholdMin: number;
  defaultDwellSecondsPerStop: number;
  schoolZoneSpeedCapMph: number;
  enableDelayNotifications: boolean;
  enableUnusualDwellAlerts: boolean;
  enableParentSmsDigest: boolean;
  dataBackendMode: 'local_demo' | 'firebase_ready' | 'node_api_ready';
}
