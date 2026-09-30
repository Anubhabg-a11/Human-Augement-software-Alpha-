import {
  ActivityType,
  FatigueLevel,
  PostureStatus,
  ProcessedMetrics,
  RiskLevel,
  SensorReading,
} from '../../types';
import {
  FatigueAnalysisResult,
  MovementAnalysisResult,
  OverallRiskResult,
  PhysicalLoadResult,
  PostureAnalysisResult,
  ScenarioBenchmarkResult,
  ValidationResult,
} from './types';

export interface AnalyticsEngineConfig {
  windowSize?: number;
  samplingRateHz?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  maxPermissibleLoadKg?: number;
}

/**
 * Standard Engine Abstraction
 * Both RuleBasedAnalyticsEngine and future MLAnalyticsEngine implement this interface
 * without requiring any modifications to frontend dashboards or consumers.
 */
export interface IAnalyticsEngine {
  readonly modelName: string;
  readonly modelVersion: string;
  readonly modelType: 'rule_based_prototype' | 'machine_learning';

  /**
   * Reset engine state, internal sliding buffers, and counters
   */
  reset(): void;

  /**
   * Validates raw input telemetry packet
   */
  validate(rawReading: unknown): ValidationResult;

  /**
   * Core pipeline: Validates, cleans, extracts features, analyzes risk, and produces ProcessedMetrics
   */
  processReading(
    reading: SensorReading,
    activityType?: ActivityType,
    restingHR?: number,
    maxHR?: number
  ): ProcessedMetrics;

  /**
   * Direct access to sub-model modular analysis for testing and deep explainability
   */
  calculateAccelerationMagnitude(reading: SensorReading): number;
  calculateAverageAcceleration(window: SensorReading[]): number;
  calculateMovementIntensity(window: SensorReading[]): number;
  calculateHeartRateLoad(heartRate: number, restingHR?: number, maxHR?: number): number;
  calculateMuscleActivity(muscleActivity: number): number;
  calculateJointAngleRisk(angle: number): { score: number; status: PostureStatus; angleNormalized: number };
  calculatePostureRisk(window: SensorReading[]): { score: number; status: PostureStatus; sustainedHighRiskFraction: number };
  calculateFatigueScore(params: {
    hrLoad: number;
    muscleActivity: number;
    physicalLoadKg: number;
    activityIntensity: number;
    activityType: ActivityType;
  }): { score: number; level: FatigueLevel; contributors: string[]; recommendedAction: string };
  calculateMovementScore(window: SensorReading[]): { score: number; abnormalEvents: number };
  calculateOverallRisk(params: {
    fatigueScore: number;
    postureScore: number;
    movementScore: number;
    physicalLoadKg: number;
  }): { overallRisk: RiskLevel; overallRiskScore: number; riskContributors: string[] };

  analyzeFatigue(window: SensorReading[], activityType: ActivityType): FatigueAnalysisResult;
  analyzePosture(window: SensorReading[]): PostureAnalysisResult;
  analyzeMovement(window: SensorReading[]): MovementAnalysisResult;
  analyzePhysicalLoad(reading: SensorReading, window: SensorReading[]): PhysicalLoadResult;
  analyzeOverallRisk(
    fatigueScore: number,
    postureScore: number,
    movementScore: number,
    physicalLoadKg: number
  ): OverallRiskResult;

  /**
   * Runs the 6 standardized benchmark scenarios for testing and validation
   */
  runBenchmarkScenarios(): ScenarioBenchmarkResult[];
}
