/**
 * HumanAugment AI · Biomechanical & Ergonomics Analytics Engine
 *
 * Modular, explainable, testable signal processing & ergonomics decision-support engine.
 * Architecture:
 *   1. Sensor Validation (sensorValidation.ts)
 *   2. Data Cleaning (dataCleaning.ts)
 *   3. Signal Processing (signalProcessing.ts)
 *   4. Feature Extraction (featureExtraction.ts)
 *   5. Fatigue Analysis (fatigueAnalysis.ts)
 *   6. Movement Analysis (movementAnalysis.ts)
 *   7. Posture Analysis (postureAnalysis.ts)
 *   8. Physical Load Analysis (physicalLoadAnalysis.ts)
 *   9. Overall Risk Analysis (overallRiskAnalysis.ts)
 *  10. Recommendation Generation (recommendations.ts)
 *
 * Designed around IAnalyticsEngine interface to seamlessly support both RuleBasedAnalyticsEngine
 * and future MLAnalyticsEngine models without modifying frontend components.
 */

// Core Abstraction & Implementation Classes
export { RuleBasedAnalyticsEngine, RuleBasedAnalyticsEngine as AnalyticsEngine } from './analytics/RuleBasedAnalyticsEngine';
export { MLAnalyticsEngine } from './analytics/MLAnalyticsEngineStub';
export type { IAnalyticsEngine, AnalyticsEngineConfig } from './analytics/IAnalyticsEngine';

// Sub-modules
export { SensorValidator, defaultSensorValidator, SENSOR_BOUNDS } from './analytics/sensorValidation';
export { DataCleaner, defaultDataCleaner } from './analytics/dataCleaning';
export { SignalProcessor } from './analytics/signalProcessing';
export * from './analytics/featureExtraction';
export { FatigueAnalyzer, defaultFatigueAnalyzer } from './analytics/fatigueAnalysis';
export { MovementAnalyzer, defaultMovementAnalyzer } from './analytics/movementAnalysis';
export { PostureAnalyzer, defaultPostureAnalyzer } from './analytics/postureAnalysis';
export { PhysicalLoadAnalyzer, defaultPhysicalLoadAnalyzer } from './analytics/physicalLoadAnalysis';
export { OverallRiskAnalyzer, defaultOverallRiskAnalyzer } from './analytics/overallRiskAnalysis';
export { RecommendationGenerator, defaultRecommendationGenerator } from './analytics/recommendations';
export { generateScenarioStream, runScenarioBenchmarks } from './analytics/scenarioBenchmark';
export { runAnalyticsUnitTests } from './analytics/analytics.test';
export type * from './analytics/types';

import { RuleBasedAnalyticsEngine } from './analytics/RuleBasedAnalyticsEngine';

// Default global instance for real-time telemetry processing
export const defaultAnalyticsEngine = new RuleBasedAnalyticsEngine(30);
