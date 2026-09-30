export type ActivityType =
  | 'rest'
  | 'walking'
  | 'light_work'
  | 'heavy_work'
  | 'repetitive_work'
  | 'recovery';

export type RiskLevel = 'low' | 'moderate' | 'high';

export type PostureStatus = 'safe' | 'attention' | 'high_risk';

export type FatigueLevel = 'low' | 'mild' | 'moderate' | 'high';

export interface SensorReading {
  timestamp: number;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  heart_rate: number;
  muscle_activity: number; // % MVC (Max Voluntary Contraction)
  joint_angle: number; // trunk/spine or knee angle in degrees
  pressure: number; // load force in kg equivalent
  temperature: number; // skin surface temp in °C
}

export interface ProcessedMetrics {
  timestamp: number;
  activityType: ActivityType;
  activityIntensity: number; // 0-100
  avgAcceleration: number; // magnitude m/s²
  movementIntensity: number; // 0-100
  movementScore: number; // 0-100 (smoothness / ergonomic efficiency)
  heartRate: number; // bpm
  heartRateLoad: number; // 0-100
  muscleActivity: number; // % MVC
  jointAngle: number; // deg
  jointAngleRisk: number; // 0-100
  postureStatus: PostureStatus;
  postureRiskScore: number; // 0-100
  fatigueScore: number; // 0-100
  fatigueLevel: FatigueLevel;
  fatigueContributors: string[];
  physicalLoad: number; // kg
  abnormalMovementEvents: number;
  repetitionCount: number;
  overallRisk: RiskLevel;
  overallRiskScore: number; // 0-100
  riskContributors: string[];
  recommendedAction: string;
}

export interface Alert {
  id: string;
  timestamp: number;
  severity: 'critical' | 'warning' | 'info';
  category: 'Fatigue' | 'Posture' | 'Physical Load' | 'Movement' | 'Heart Rate' | 'Hardware';
  title: string;
  description: string;
  recommendedAction: string;
  isRead: boolean;
  sessionId?: string;
}

export interface SessionSummary {
  avgHeartRate: number;
  peakHeartRate: number;
  avgMuscleActivity: number;
  peakMuscleActivity: number;
  avgFatigueScore: number;
  peakFatigueScore: number;
  avgPostureScore: number;
  timeInHighRiskPostureSeconds: number;
  movementScore: number;
  totalRepetitions: number;
  abnormalMovementCount: number;
  overallRisk: RiskLevel;
  alertsCount: number;
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  status: 'active' | 'paused' | 'completed';
  activityType: ActivityType;
  title: string;
  notes?: string;
  summary: SessionSummary;
  readingsCount: number;
  recentReadings?: SensorReading[];
  metricHistory?: ProcessedMetrics[];
  alertsGenerated: string[]; // Alert IDs
}

export interface HardwareVector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Official Hardware Integration Contract
 * Documented JSON Schema for ESP32 / IoT Microcontroller Ingestion
 */
export interface HardwareSensorPayload {
  deviceId: string;
  timestamp: number;
  sequenceNumber: number;
  accelerometer: HardwareVector3;
  gyroscope: HardwareVector3;
  heartRate: number;
  muscleActivity: number;
  jointAngle: number;
  pressure: number;
  temperature: number;
}

export interface IngestionLog {
  id: string;
  timestamp: number;
  deviceId: string;
  sequenceNumber: number;
  status: 200 | 400 | 401 | 409 | 429 | 500;
  latencyMs: number;
  payloadSummary: string;
  issues?: string[];
}

export interface Device {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  firmwareVersion: string;
  status: 'SIMULATED' | 'ONLINE' | 'OFFLINE';
  lastSeen: number;
  batteryLevel: number;
  connectionType: 'BLE 5.2' | 'WiFi 802.11 b/g/n' | 'USB-Serial';
  sampleRateHz: number;
  hardwareMac?: string;
  ipAddress?: string;
  apiKey?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  maxHeartRate: number;
  restingHeartRate: number;
  weightKg: number;
  maxLoadPermissibleKg: number;
  createdAt: number;
  alertThresholds: {
    fatigueWarning: number;
    postureAngleMaxDeg: number;
    heartRateMaxBpm: number;
    loadLimitKg: number;
  };
}

export type NavItem =
  | 'dashboard'
  | 'competition-demo'
  | 'live-monitoring'
  | 'analytics'
  | 'fatigue'
  | 'movement'
  | 'alerts'
  | 'sessions'
  | 'reports'
  | 'devices'
  | 'hardware-guide'
  | 'profile'
  | 'settings';
