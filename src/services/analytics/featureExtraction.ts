import { SensorReading } from '../../types';
import { SignalProcessor } from './signalProcessing';

/**
 * Reusable Feature Extraction Functions
 * Modular, unit-testable signal features for ergonomics, biomechanics, and kinematic ML models.
 */

/**
 * 1. Acceleration Magnitude: Scalar magnitude sqrt(ax^2 + ay^2 + az^2)
 */
export function calculateAccelerationMagnitude(reading: SensorReading): number {
  return SignalProcessor.calculateAccelerationMagnitude(reading);
}

/**
 * 2. Mean Acceleration: Rolling arithmetic mean of acceleration magnitude across window
 */
export function calculateMeanAcceleration(window: SensorReading[]): number {
  if (window.length === 0) return 9.81;
  const magnitudes = window.map(r => calculateAccelerationMagnitude(r));
  return SignalProcessor.calculateMean(magnitudes);
}

/**
 * 3. Peak Acceleration: Maximum acceleration magnitude observed in temporal window
 */
export function calculatePeakAcceleration(window: SensorReading[]): number {
  if (window.length === 0) return 9.81;
  const magnitudes = window.map(r => calculateAccelerationMagnitude(r));
  return Number(Math.max(...magnitudes).toFixed(2));
}

/**
 * 4. Movement Intensity: Normalized (0-100) dynamic acceleration and angular velocity index
 */
export function calculateMovementIntensity(window: SensorReading[]): number {
  if (window.length === 0) return 0;
  const latest = window[window.length - 1];
  const dynamicAcc = SignalProcessor.calculateDynamicAcceleration(latest);
  const gyroMag = SignalProcessor.calculateAngularVelocityMagnitude(latest);

  // Scaled: Dynamic acceleration up to 8 m/s² contributes up to 65 pts;
  // Angular velocity up to 180 deg/s contributes up to 35 pts.
  const score = (dynamicAcc / 8) * 65 + (gyroMag / 180) * 35;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * 5. Angular Velocity: Scalar magnitude of 3-axis gyroscope reading
 */
export function calculateAngularVelocity(reading: SensorReading): number {
  return SignalProcessor.calculateAngularVelocityMagnitude(reading);
}

/**
 * 6. Mean Heart Rate: Average BPM across temporal window
 */
export function calculateMeanHeartRate(window: SensorReading[]): number {
  if (window.length === 0) return 70;
  const rates = window.map(r => r.heart_rate);
  return Math.round(SignalProcessor.calculateMean(rates));
}

/**
 * 7. Peak Heart Rate: Highest BPM observed in temporal window
 */
export function calculatePeakHeartRate(window: SensorReading[]): number {
  if (window.length === 0) return 70;
  const rates = window.map(r => r.heart_rate);
  return Math.max(...rates);
}

/**
 * 8. Heart-Rate Load: Karvonen Heart Rate Reserve percentage (0-100)
 * Formula: HR_load% = (HR - HR_rest) / (HR_max - HR_rest) * 100
 */
export function calculateHeartRateLoad(
  heartRate: number,
  restingHR: number = 65,
  maxHR: number = 185
): number {
  if (heartRate <= restingHR) return 5;
  const divisor = Math.max(1, maxHR - restingHR);
  const load = ((heartRate - restingHR) / divisor) * 100;
  return Math.min(100, Math.max(0, Math.round(load)));
}

/**
 * 9. Mean Muscle Activity: Average surface electromyography activation (% MVC) across window
 */
export function calculateMeanMuscleActivity(window: SensorReading[]): number {
  if (window.length === 0) return 5;
  const emg = window.map(r => r.muscle_activity);
  return SignalProcessor.calculateMean(emg);
}

/**
 * Normalized Muscle Activity (% MVC, clamped 0 - 100)
 */
export function calculateMuscleActivity(muscleActivity: number): number {
  return Math.min(100, Math.max(0, Number(muscleActivity.toFixed(1))));
}

/**
 * 10. Peak Muscle Activity: Maximum electromyography activation (% MVC) in window
 */
export function calculatePeakMuscleActivity(window: SensorReading[]): number {
  if (window.length === 0) return 5;
  const emg = window.map(r => r.muscle_activity);
  return Number(Math.max(...emg).toFixed(1));
}

/**
 * 11. Joint-Angle Deviation: Absolute degrees deviation from ergonomic neutral posture (0°)
 */
export function calculateJointAngleDeviation(
  window: SensorReading[],
  neutralAngle: number = 0
): number {
  if (window.length === 0) return 0;
  const latest = window[window.length - 1];
  return Number(Math.abs(latest.joint_angle - neutralAngle).toFixed(1));
}

/**
 * 12. Repetitive Movement Count: Hysteresis peak-valley detection across joint angle cycles
 */
export function calculateRepetitiveMovementCount(window: SensorReading[]): number {
  if (window.length < 3) return 0;
  let count = 0;
  let inPeak = false;

  for (let i = 0; i < window.length; i++) {
    const angle = Math.abs(window[i].joint_angle);
    if (angle > 30 && !inPeak) {
      count++;
      inPeak = true;
    } else if (angle < 15 && inPeak) {
      inPeak = false;
    }
  }

  return count;
}

/**
 * 13. Activity Duration: Continuous active working duration in seconds
 */
export function calculateActivityDuration(startTimeMs: number, currentTimeMs: number = Date.now()): number {
  if (startTimeMs <= 0) return 0;
  return Math.max(0, Math.floor((currentTimeMs - startTimeMs) / 1000));
}

/**
 * 14. Recovery Duration: Duration of active rest or baseline recovery in seconds
 */
export function calculateRecoveryDuration(recoveryStartMs: number, currentTimeMs: number = Date.now()): number {
  if (recoveryStartMs <= 0) return 0;
  return Math.max(0, Math.floor((currentTimeMs - recoveryStartMs) / 1000));
}
