import {
  ActivityType,
  FatigueLevel,
  PostureStatus,
  ProcessedMetrics,
  RiskLevel,
  SensorReading,
} from '../../types';
import { DataCleaner } from './dataCleaning';
import {
  calculateActivityDuration,
  calculateHeartRateLoad,
  calculateMeanAcceleration,
  calculateMovementIntensity,
  calculateMuscleActivity,
} from './featureExtraction';
import { FatigueAnalyzer } from './fatigueAnalysis';
import { IAnalyticsEngine } from './IAnalyticsEngine';
import { MovementAnalyzer } from './movementAnalysis';
import { OverallRiskAnalyzer } from './overallRiskAnalysis';
import { PhysicalLoadAnalyzer } from './physicalLoadAnalysis';
import { PostureAnalyzer } from './postureAnalysis';
import { RecommendationGenerator } from './recommendations';
import { runScenarioBenchmarks } from './scenarioBenchmark';
import { SensorValidator } from './sensorValidation';
import {
  FatigueAnalysisResult,
  MovementAnalysisResult,
  OverallRiskResult,
  PhysicalLoadResult,
  PostureAnalysisResult,
  ScenarioBenchmarkResult,
  ValidationResult,
} from './types';

export class RuleBasedAnalyticsEngine implements IAnalyticsEngine {
  public readonly modelName = 'Prototype Analytical Model (Rule-Based)';
  public readonly modelVersion = '2.4.0-prototype';
  public readonly modelType = 'rule_based_prototype' as const;

  // 10 Decoupled Pipeline Modules
  private validator = new SensorValidator();
  private cleaner = new DataCleaner();
  private fatigueAnalyzer = new FatigueAnalyzer();
  private movementAnalyzer = new MovementAnalyzer();
  private postureAnalyzer = new PostureAnalyzer();
  private physicalLoadAnalyzer = new PhysicalLoadAnalyzer();
  private overallRiskAnalyzer = new OverallRiskAnalyzer();
  private recommendationGenerator = new RecommendationGenerator();

  // Internal state
  private windowSize: number = 30;
  private readingsBuffer: SensorReading[] = [];
  private sessionStartTime: number = Date.now();

  constructor(windowSize: number = 30) {
    this.windowSize = windowSize;
  }

  public reset(): void {
    this.readingsBuffer = [];
    this.validator.reset();
    this.cleaner.reset();
    this.fatigueAnalyzer.reset();
    this.movementAnalyzer.reset();
    this.postureAnalyzer.reset();
    this.sessionStartTime = Date.now();
  }

  public validate(rawReading: unknown): ValidationResult {
    return this.validator.validate(rawReading);
  }

  /**
   * Pipeline Execution:
   * 1. Validate raw data
   * 2. Clean & sanitize values
   * 3. Add to sliding temporal buffer
   * 4. Feature Extraction & Signal Processing
   * 5. Posture, Movement, Physical Load, & Fatigue Analysis
   * 6. Overall Risk Synthesis & Recommendation Generation
   */
  public processReading(
    reading: SensorReading,
    activityType: ActivityType = 'light_work',
    restingHR: number = 65,
    maxHR: number = 185
  ): ProcessedMetrics {
    // 1 & 2: Validate & Clean
    const validation = this.validator.validate(reading);
    const cleanedReading = validation.sanitized ? this.cleaner.clean(validation.sanitized) : this.cleaner.clean(reading);

    // 3: Sliding buffer window
    this.readingsBuffer.push(cleanedReading);
    if (this.readingsBuffer.length > this.windowSize) {
      this.readingsBuffer.shift();
    }

    // 4: Feature Extraction
    const avgAcc = calculateMeanAcceleration(this.readingsBuffer);
    const movementIntensity = calculateMovementIntensity(this.readingsBuffer);
    const hrLoad = calculateHeartRateLoad(cleanedReading.heart_rate, restingHR, maxHR);
    const muscleLoad = calculateMuscleActivity(cleanedReading.muscle_activity);
    const continuousSeconds = calculateActivityDuration(this.sessionStartTime, cleanedReading.timestamp);

    // 5: Movement Analysis
    const movementResult = this.movementAnalyzer.analyze(this.readingsBuffer);

    // 6: Posture Analysis
    const postureResult = this.postureAnalyzer.analyze(this.readingsBuffer);

    // 7: Physical Load Analysis
    const physicalLoadResult = this.physicalLoadAnalyzer.analyze(cleanedReading, this.readingsBuffer);

    // 8: Fatigue Analysis
    const fatigueResult = this.fatigueAnalyzer.analyze({
      heartRate: cleanedReading.heart_rate,
      heartRateLoad: hrLoad,
      muscleActivity: muscleLoad,
      movementIntensity,
      continuousActivityDurationSeconds: continuousSeconds,
      recoveryDurationSeconds: activityType === 'recovery' ? 120 : 0,
      activityType,
    });

    // 9: Overall Risk Analysis
    const overallResult = this.overallRiskAnalyzer.analyze({
      fatigueScore: fatigueResult.score,
      postureScore: postureResult.score,
      movementScore: movementResult.movementScore,
      physicalLoadKg: physicalLoadResult.currentLoadKg,
    });

    // 10: Recommendation Generation
    const recommendations = this.recommendationGenerator.generate({
      fatigueLevel: fatigueResult.level,
      fatigueScore: fatigueResult.score,
      postureStatus: postureResult.status,
      jointAngle: cleanedReading.joint_angle,
      physicalLoadKg: physicalLoadResult.currentLoadKg,
      overallRisk: overallResult.level,
      activityType,
      abnormalMovementCount: movementResult.abnormalMovementEvents,
      sustainedAwkwardExposure: postureResult.sustainedAwkwardExposure,
    });

    return {
      timestamp: cleanedReading.timestamp,
      activityType,
      activityIntensity: movementIntensity,
      avgAcceleration: avgAcc,
      movementIntensity,
      movementScore: movementResult.movementScore,
      heartRate: cleanedReading.heart_rate,
      heartRateLoad: hrLoad,
      muscleActivity: muscleLoad,
      jointAngle: Number(cleanedReading.joint_angle.toFixed(1)),
      jointAngleRisk: postureResult.score,
      postureStatus: postureResult.status,
      postureRiskScore: postureResult.score,
      fatigueScore: fatigueResult.score,
      fatigueLevel: fatigueResult.level,
      fatigueContributors: fatigueResult.contributors,
      physicalLoad: Number(cleanedReading.pressure.toFixed(1)),
      abnormalMovementEvents: movementResult.abnormalMovementEvents,
      repetitionCount: movementResult.repetitionCount,
      overallRisk: overallResult.level,
      overallRiskScore: overallResult.score,
      riskContributors: overallResult.contributors,
      recommendedAction: recommendations.primaryAction,
    };
  }

  public analyzeFatigue(window: SensorReading[], activityType: ActivityType): FatigueAnalysisResult {
    const latest = window[window.length - 1] || { heart_rate: 70, muscle_activity: 10, pressure: 0, joint_angle: 0, timestamp: Date.now() };
    const hrLoad = calculateHeartRateLoad(latest.heart_rate);
    const intensity = calculateMovementIntensity(window);
    return this.fatigueAnalyzer.analyze({
      heartRate: latest.heart_rate,
      heartRateLoad: hrLoad,
      muscleActivity: latest.muscle_activity,
      movementIntensity: intensity,
      continuousActivityDurationSeconds: 300,
      activityType,
    });
  }

  public analyzePosture(window: SensorReading[]): PostureAnalysisResult {
    return this.postureAnalyzer.analyze(window);
  }

  public analyzeMovement(window: SensorReading[]): MovementAnalysisResult {
    return this.movementAnalyzer.analyze(window);
  }

  public analyzePhysicalLoad(reading: SensorReading, window: SensorReading[]): PhysicalLoadResult {
    return this.physicalLoadAnalyzer.analyze(reading, window);
  }

  public analyzeOverallRisk(
    fatigueScore: number,
    postureScore: number,
    movementScore: number,
    physicalLoadKg: number
  ): OverallRiskResult {
    const overallResult = this.overallRiskAnalyzer.analyze({
      fatigueScore,
      postureScore,
      movementScore,
      physicalLoadKg,
    });
    return {
      score: overallResult.score,
      level: overallResult.level,
      levelUpper: overallResult.levelUpper,
      contributors: overallResult.contributors,
      confidenceNote: overallResult.confidenceNote,
      modelDesignation: overallResult.modelDesignation,
    };
  }

  // Compatibility helper methods for direct feature/sub-model querying
  public calculateAccelerationMagnitude(reading: SensorReading): number {
    return calculateMeanAcceleration([reading]);
  }

  public calculateAverageAcceleration(window: SensorReading[]): number {
    return calculateMeanAcceleration(window);
  }

  public calculateMovementIntensity(window: SensorReading[]): number {
    return calculateMovementIntensity(window);
  }

  public calculateHeartRateLoad(heartRate: number, restingHR?: number, maxHR?: number): number {
    return calculateHeartRateLoad(heartRate, restingHR, maxHR);
  }

  public calculateMuscleActivity(muscleActivity: number): number {
    return calculateMuscleActivity(muscleActivity);
  }

  public calculateJointAngleRisk(angle: number): { score: number; status: PostureStatus; angleNormalized: number } {
    const instant = this.postureAnalyzer.evaluateInstantAngle(angle);
    return { score: instant.score, status: instant.status, angleNormalized: Number(Math.abs(angle).toFixed(1)) };
  }

  public calculatePostureRisk(window: SensorReading[]): { score: number; status: PostureStatus; sustainedHighRiskFraction: number } {
    const res = this.postureAnalyzer.analyze(window);
    return { score: res.score, status: res.status, sustainedHighRiskFraction: res.sustainedAwkwardExposure ? 0.5 : 0.1 };
  }

  public calculateFatigueScore(params: {
    hrLoad: number;
    muscleActivity: number;
    physicalLoadKg: number;
    activityIntensity: number;
    activityType: ActivityType;
  }): { score: number; level: FatigueLevel; contributors: string[]; recommendedAction: string } {
    const res = this.fatigueAnalyzer.analyze({
      heartRate: 75,
      heartRateLoad: params.hrLoad,
      muscleActivity: params.muscleActivity,
      movementIntensity: params.activityIntensity,
      continuousActivityDurationSeconds: 300,
      activityType: params.activityType,
    });
    return { score: res.score, level: res.level, contributors: res.contributors, recommendedAction: res.recommendation };
  }

  public calculateMovementScore(window: SensorReading[]): { score: number; abnormalEvents: number } {
    const res = this.movementAnalyzer.analyze(window);
    return { score: res.movementScore, abnormalEvents: res.abnormalMovementEvents };
  }

  public calculateOverallRisk(params: {
    fatigueScore: number;
    postureScore: number;
    movementScore: number;
    physicalLoadKg: number;
  }): { overallRisk: RiskLevel; overallRiskScore: number; riskContributors: string[] } {
    const res = this.overallRiskAnalyzer.analyze(params);
    return { overallRisk: res.level, overallRiskScore: res.score, riskContributors: res.contributors };
  }

  public runBenchmarkScenarios(): ScenarioBenchmarkResult[] {
    return runScenarioBenchmarks(this);
  }
}
