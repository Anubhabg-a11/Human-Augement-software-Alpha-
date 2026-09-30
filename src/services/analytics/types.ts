import { ActivityType, FatigueLevel, PostureStatus, ProcessedMetrics, RiskLevel, SensorReading } from '../../types';

export interface ValidationIssue {
  field: string;
  code: 'MISSING_FIELD' | 'NOT_NUMERIC' | 'IMPOSSIBLE_RANGE' | 'OUT_OF_ORDER_TIMESTAMP' | 'DUPLICATE_TIMESTAMP' | 'FUTURE_TIMESTAMP' | 'NAN_OR_INFINITY';
  message: string;
  rawValue?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  sanitized: SensorReading | null;
  isDuplicate: boolean;
  hasOutliers: boolean;
}

export interface SignalFeatures {
  accMagnitude: number;
  meanAcc: number;
  peakAcc: number;
  gyroMagnitude: number;
  meanHeartRate: number;
  peakHeartRate: number;
  hrLoad: number;
  meanMuscleActivity: number;
  peakMuscleActivity: number;
  jointAngleDeviation: number;
  jerk: number;
  activityIntensity: number;
}

export interface FatigueAnalysisResult {
  score: number; // 0-100
  level: FatigueLevel;
  levelUpper: 'LOW' | 'MILD' | 'MODERATE' | 'HIGH';
  contributors: string[];
  trend: 'increasing' | 'stable' | 'recovering';
  recommendation: string;
  weights: {
    hrLoadWeight: number;
    muscleActivityWeight: number;
    physicalLoadWeight: number;
    intensityWeight: number;
    durationPenalty: number;
    recoveryCredit: number;
  };
}

export interface MovementAnalysisResult {
  movementIntensity: number; // 0-100
  movementConsistency: number; // 0-100
  abnormalMovementEvents: number;
  repetitionCount: number;
  movementQuality: number; // 0-100 (smoothness)
  movementScore: number; // Alias for UI compatibility
  meanJerk: number;
}

export interface PostureAnalysisResult {
  jointAngle: number;
  status: PostureStatus;
  statusUpper: 'SAFE' | 'ATTENTION' | 'HIGH RISK';
  score: number; // 0-100
  timeSpentOutsideSafeRangeSeconds: number;
  repetitivePostureEvents: number;
  sustainedAwkwardExposure: boolean;
  iso11226RiskTier: 'Acceptable' | 'Conditionally Acceptable' | 'Not Recommended';
}

export interface PhysicalLoadResult {
  currentLoadKg: number;
  meanLoadKg: number;
  peakLoadKg: number;
  loadRiskScore: number; // 0-100
  exceedsPermissibleLimit: boolean;
  guidelineMaxKg: number;
  musculoskeletalDemand: 'Low' | 'Moderate' | 'Heavy' | 'Hazardous';
}

export interface OverallRiskResult {
  score: number; // 0-100
  level: RiskLevel;
  levelUpper: 'LOW' | 'MODERATE' | 'HIGH';
  contributors: string[];
  confidenceNote: string;
  modelDesignation: string;
}

export interface ScenarioBenchmarkResult {
  scenario: ActivityType;
  scenarioName: string;
  sampleCount: number;
  initialReading: SensorReading;
  finalMetrics: ProcessedMetrics;
  fatigueScore: number;
  fatigueLevel: FatigueLevel;
  postureStatus: PostureStatus;
  overallRisk: RiskLevel;
  logicalAssertionsPass: boolean;
  notes: string;
}
