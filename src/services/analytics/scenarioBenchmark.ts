import { ActivityType, SensorReading } from '../../types';
import { IAnalyticsEngine } from './IAnalyticsEngine';
import { ScenarioBenchmarkResult } from './types';

/**
 * Generates synthetic deterministic sensor stream for testing each operational scenario.
 */
export function generateScenarioStream(scenario: ActivityType, count: number = 30): SensorReading[] {
  const readings: SensorReading[] = [];
  const baseTime = Date.now() - count * 100;

  for (let i = 0; i < count; i++) {
    const t = baseTime + i * 100;
    const phase = (i / 10) * Math.PI * 2;

    switch (scenario) {
      case 'rest':
        readings.push({
          timestamp: t,
          acc_x: Number((Math.sin(phase) * 0.05).toFixed(3)),
          acc_y: Number((Math.cos(phase) * 0.05).toFixed(3)),
          acc_z: 9.81,
          gyro_x: 0.2,
          gyro_y: 0.1,
          gyro_z: 0.1,
          heart_rate: Math.round(62 + Math.sin(phase) * 3),
          muscle_activity: Number((5 + Math.sin(phase) * 2).toFixed(1)),
          joint_angle: Number((3 + Math.sin(phase) * 2).toFixed(1)),
          pressure: 0,
          temperature: 36.6,
        });
        break;

      case 'walking':
        readings.push({
          timestamp: t,
          acc_x: Number((Math.sin(phase) * 0.8).toFixed(3)),
          acc_y: Number((Math.cos(phase) * 1.5).toFixed(3)),
          acc_z: Number((9.81 + Math.sin(phase * 2) * 2.2).toFixed(3)),
          gyro_x: Number((Math.sin(phase) * 25).toFixed(1)),
          gyro_y: Number((Math.cos(phase) * 35).toFixed(1)),
          gyro_z: Number((Math.sin(phase * 2) * 15).toFixed(1)),
          heart_rate: Math.round(88 + Math.sin(phase) * 5),
          muscle_activity: Number((22 + Math.sin(phase) * 6).toFixed(1)),
          joint_angle: Number((12 + Math.sin(phase) * 4).toFixed(1)),
          pressure: 1.5,
          temperature: 36.8,
        });
        break;

      case 'light_work':
        readings.push({
          timestamp: t,
          acc_x: Number((Math.sin(phase) * 0.3).toFixed(3)),
          acc_y: Number((Math.cos(phase) * 0.4).toFixed(3)),
          acc_z: Number((9.81 + Math.sin(phase) * 0.6).toFixed(3)),
          gyro_x: Number((Math.sin(phase) * 12).toFixed(1)),
          gyro_y: Number((Math.cos(phase) * 18).toFixed(1)),
          gyro_z: Number((Math.sin(phase) * 8).toFixed(1)),
          heart_rate: Math.round(84 + Math.sin(phase) * 4),
          muscle_activity: Number((28 + Math.sin(phase) * 6).toFixed(1)),
          joint_angle: Number((18 + Math.sin(phase) * 5).toFixed(1)),
          pressure: 5.5,
          temperature: 36.7,
        });
        break;

      case 'heavy_work':
        readings.push({
          timestamp: t,
          acc_x: Number((Math.sin(phase) * 1.8).toFixed(3)),
          acc_y: Number((Math.cos(phase) * 2.5).toFixed(3)),
          acc_z: Number((9.81 + Math.sin(phase) * 4.2).toFixed(3)),
          gyro_x: Number((Math.sin(phase) * 45).toFixed(1)),
          gyro_y: Number((Math.cos(phase) * 55).toFixed(1)),
          gyro_z: Number((Math.sin(phase) * 30).toFixed(1)),
          heart_rate: Math.round(138 + Math.sin(phase) * 8),
          muscle_activity: Number((72 + Math.sin(phase) * 12).toFixed(1)),
          joint_angle: Number((48 + Math.sin(phase) * 8).toFixed(1)),
          pressure: 28.5,
          temperature: 37.4,
        });
        break;

      case 'repetitive_work':
        // Alternating deep flexion cycles to trigger repetition detection
        const cyclicBend = Math.sin(phase) > 0 ? 42 : 12;
        readings.push({
          timestamp: t,
          acc_x: Number((Math.sin(phase) * 0.8).toFixed(3)),
          acc_y: Number((Math.cos(phase) * 1.2).toFixed(3)),
          acc_z: Number((9.81 + Math.sin(phase) * 2.0).toFixed(3)),
          gyro_x: Number((Math.sin(phase) * 30).toFixed(1)),
          gyro_y: Number((Math.cos(phase) * 40).toFixed(1)),
          gyro_z: 10,
          heart_rate: Math.round(108 + Math.sin(phase) * 6),
          muscle_activity: Number((54 + Math.sin(phase) * 10).toFixed(1)),
          joint_angle: Number((cyclicBend + Math.sin(phase) * 3).toFixed(1)),
          pressure: 14.0,
          temperature: 37.1,
        });
        break;

      case 'recovery':
        readings.push({
          timestamp: t,
          acc_x: Number((Math.sin(phase) * 0.08).toFixed(3)),
          acc_y: Number((Math.cos(phase) * 0.08).toFixed(3)),
          acc_z: 9.81,
          gyro_x: 0.5,
          gyro_y: 0.5,
          gyro_z: 0.2,
          heart_rate: Math.round(72 - (i / count) * 8), // Heart rate declining
          muscle_activity: Number((10 - (i / count) * 3).toFixed(1)),
          joint_angle: 4,
          pressure: 0,
          temperature: 36.5,
        });
        break;
    }
  }

  return readings;
}

/**
 * Executes and validates all 6 required benchmark scenarios through an engine instance.
 */
export function runScenarioBenchmarks(engine: IAnalyticsEngine): ScenarioBenchmarkResult[] {
  const scenarios: { type: ActivityType; name: string }[] = [
    { type: 'rest', name: 'Baseline Ergonomic Rest' },
    { type: 'walking', name: 'Bipedal Gait & Locomotion' },
    { type: 'light_work', name: 'Manual Assembly (Light Work)' },
    { type: 'heavy_work', name: 'Pallet Transfer (Heavy Work)' },
    { type: 'repetitive_work', name: 'Cyclic Sorting (Repetitive Work)' },
    { type: 'recovery', name: 'Active Respiration (Recovery)' },
  ];

  const results: ScenarioBenchmarkResult[] = [];

  for (const s of scenarios) {
    engine.reset();
    const stream = generateScenarioStream(s.type, 30);
    let finalMetrics = engine.processReading(stream[0], s.type);

    for (let i = 1; i < stream.length; i++) {
      finalMetrics = engine.processReading(stream[i], s.type);
    }

    // Verify logical assertions
    let assertionsPass = true;
    let notes = '';

    if (s.type === 'rest') {
      assertionsPass = finalMetrics.fatigueScore < 30 && finalMetrics.postureStatus === 'safe' && finalMetrics.overallRisk === 'low';
      notes = assertionsPass ? 'Logical: Rest exhibits low fatigue, neutral posture, and minimal risk.' : 'Assertion Failure';
    } else if (s.type === 'walking') {
      assertionsPass = finalMetrics.avgAcceleration > 9.5 && finalMetrics.movementScore >= 70;
      notes = assertionsPass ? 'Logical: Walking exhibits dynamic acceleration and controlled movement quality.' : 'Assertion Failure';
    } else if (s.type === 'light_work') {
      assertionsPass = finalMetrics.overallRisk !== 'high';
      notes = assertionsPass ? 'Logical: Light work maintains sustainable metabolic and posture parameters.' : 'Assertion Failure';
    } else if (s.type === 'heavy_work') {
      assertionsPass = finalMetrics.fatigueScore >= 40 && (finalMetrics.overallRisk === 'moderate' || finalMetrics.overallRisk === 'high');
      notes = assertionsPass ? 'Logical: Heavy work elevates cardiovascular reserve, muscle EMG, and overall risk tier.' : 'Assertion Failure';
    } else if (s.type === 'repetitive_work') {
      assertionsPass = finalMetrics.repetitionCount >= 1 && finalMetrics.muscleActivity > 30;
      notes = assertionsPass ? `Logical: Repetitive work successfully incremented repetition count (${finalMetrics.repetitionCount} cycles).` : 'Assertion Failure';
    } else if (s.type === 'recovery') {
      assertionsPass = finalMetrics.overallRisk === 'low' && finalMetrics.fatigueScore < 35;
      notes = assertionsPass ? 'Logical: Recovery mode lowers fatigue and stabilizes cardiovascular reserve.' : 'Assertion Failure';
    }

    results.push({
      scenario: s.type,
      scenarioName: s.name,
      sampleCount: stream.length,
      initialReading: stream[0],
      finalMetrics,
      fatigueScore: finalMetrics.fatigueScore,
      fatigueLevel: finalMetrics.fatigueLevel,
      postureStatus: finalMetrics.postureStatus,
      overallRisk: finalMetrics.overallRisk,
      logicalAssertionsPass: assertionsPass,
      notes,
    });
  }

  return results;
}
