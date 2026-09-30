import { RuleBasedAnalyticsEngine } from './RuleBasedAnalyticsEngine';
import { defaultSensorValidator } from './sensorValidation';
import { defaultDataCleaner } from './dataCleaning';
import {
  calculateAccelerationMagnitude,
  calculateHeartRateLoad,
  calculateMeanAcceleration,
  calculateMovementIntensity,
  calculateRepetitiveMovementCount,
} from './featureExtraction';
import { runScenarioBenchmarks } from './scenarioBenchmark';
import { SensorReading } from '../../types';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Self-contained executable unit tests for the analytics engine.
 */
export function runAnalyticsUnitTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  const assert = (suite: string, name: string, condition: boolean, message: string) => {
    results.push({
      suite,
      name,
      passed: condition,
      message: condition ? `PASSED: ${message}` : `FAILED: ${message}`,
    });
  };

  // 1. SENSOR VALIDATION TESTS
  const validator = defaultSensorValidator;
  validator.reset();

  // Test 1.1: Malformed payload (null/empty)
  const res1 = validator.validate(null);
  assert('Sensor Validation', 'Reject null payload', !res1.isValid && res1.issues.length > 0, 'Null payload rejected correctly.');

  // Test 1.2: Missing fields
  const res2 = validator.validate({ acc_x: 0, acc_y: 0 });
  assert('Sensor Validation', 'Detect missing required fields', !res2.isValid && res2.issues.some(i => i.code === 'MISSING_FIELD'), 'Missing fields detected.');

  // Test 1.3: NaN & Infinity values
  const res3 = validator.validate({
    timestamp: Date.now(),
    acc_x: NaN,
    acc_y: Infinity,
    acc_z: 9.81,
    gyro_x: 0,
    gyro_y: 0,
    gyro_z: 0,
    heart_rate: 75,
    muscle_activity: 10,
    joint_angle: 5,
    pressure: 0,
    temperature: 36.5,
  });
  assert('Sensor Validation', 'Flag NaN and Infinity', !res3.isValid && res3.issues.some(i => i.code === 'NAN_OR_INFINITY'), 'Non-finite numeric values caught.');

  // Test 1.4: Impossible Ranges (e.g. Heart rate = 999, joint angle = 300)
  const res4 = validator.validate({
    timestamp: Date.now(),
    acc_x: 0,
    acc_y: 0,
    acc_z: 9.81,
    gyro_x: 0,
    gyro_y: 0,
    gyro_z: 0,
    heart_rate: 999,
    muscle_activity: 10,
    joint_angle: 300,
    pressure: 0,
    temperature: 36.5,
  });
  assert('Sensor Validation', 'Detect impossible ranges', res4.hasOutliers && res4.issues.some(i => i.code === 'IMPOSSIBLE_RANGE'), 'Out-of-range sensor readings flagged.');

  // Test 1.5: Duplicate Timestamp
  const now = Date.now();
  validator.validate({
    timestamp: now,
    acc_x: 0, acc_y: 0, acc_z: 9.81, gyro_x: 0, gyro_y: 0, gyro_z: 0,
    heart_rate: 70, muscle_activity: 5, joint_angle: 0, pressure: 0, temperature: 36.5,
  });
  const res5 = validator.validate({
    timestamp: now,
    acc_x: 0, acc_y: 0, acc_z: 9.81, gyro_x: 0, gyro_y: 0, gyro_z: 0,
    heart_rate: 70, muscle_activity: 5, joint_angle: 0, pressure: 0, temperature: 36.5,
  });
  assert('Sensor Validation', 'Detect duplicate timestamps', res5.isDuplicate, 'Duplicate timestamp flagged.');

  // 2. DATA CLEANING & CLAMPING TESTS
  const cleaner = defaultDataCleaner;
  cleaner.reset();

  const cleaned = cleaner.clean({
    heart_rate: 450, // way above 240
    joint_angle: -250, // way below -180
    pressure: -50, // negative pressure
  });
  assert('Data Cleaning', 'Clamp extreme values to safe boundaries', cleaned.heart_rate <= 240 && cleaned.joint_angle >= -180 && cleaned.pressure >= 0, 'Clamped values within physical limits.');

  // 3. FEATURE EXTRACTION TESTS
  // Test 3.1: Acceleration magnitude of stationary 1G vector [0, 0, 9.81]
  const mockStationary: SensorReading = {
    timestamp: Date.now(),
    acc_x: 0, acc_y: 0, acc_z: 9.81,
    gyro_x: 0, gyro_y: 0, gyro_z: 0,
    heart_rate: 65, muscle_activity: 5, joint_angle: 0, pressure: 0, temperature: 36.5,
  };
  const mag = calculateAccelerationMagnitude(mockStationary);
  assert('Feature Extraction', 'Stationary acceleration magnitude is ~9.81', Math.abs(mag - 9.81) < 0.05, `Magnitude = ${mag}`);

  // Test 3.2: Karvonen Heart Rate Load
  const hrRestLoad = calculateHeartRateLoad(65, 65, 185);
  const hrMaxLoad = calculateHeartRateLoad(185, 65, 185);
  const hrMidLoad = calculateHeartRateLoad(125, 65, 185);
  assert('Feature Extraction', 'Karvonen HR load calculates accurately', hrRestLoad <= 10 && hrMaxLoad === 100 && hrMidLoad === 50, `Rest: ${hrRestLoad}%, Mid: ${hrMidLoad}%, Max: ${hrMaxLoad}%`);

  // Test 3.3: Repetition Detector
  const cyclicReadings: SensorReading[] = [
    { ...mockStationary, joint_angle: 5 },
    { ...mockStationary, joint_angle: 42 }, // peak 1
    { ...mockStationary, joint_angle: 10 }, // valley 1
    { ...mockStationary, joint_angle: 45 }, // peak 2
    { ...mockStationary, joint_angle: 8 },  // valley 2
  ];
  const reps = calculateRepetitiveMovementCount(cyclicReadings);
  assert('Feature Extraction', 'Repetition count detected 2 cyclic peaks', reps === 2, `Detected reps: ${reps}`);

  // 4. SCENARIO BENCHMARKS (6 Scenarios: Rest, Walking, Light work, Heavy work, Repetitive work, Recovery)
  const engine = new RuleBasedAnalyticsEngine();
  const benchmarkResults = runScenarioBenchmarks(engine);

  for (const b of benchmarkResults) {
    assert(
      'Scenario Benchmark',
      `Scenario: ${b.scenarioName} logical checks`,
      b.logicalAssertionsPass,
      `${b.scenarioName} -> Fatigue: ${b.fatigueScore} (${b.fatigueLevel}), Posture: ${b.postureStatus}, Overall Risk: ${b.overallRisk}. Notes: ${b.notes}`
    );
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}
