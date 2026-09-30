import { SensorReading } from '../../types';
import { SENSOR_BOUNDS } from './sensorValidation';

export class DataCleaner {
  private lastValidReading: SensorReading | null = null;
  private emaAlpha: number = 0.35; // Exponential Moving Average smoothing factor

  constructor(emaAlpha: number = 0.35) {
    this.emaAlpha = emaAlpha;
  }

  public reset(): void {
    this.lastValidReading = null;
  }

  /**
   * Imputes missing or corrupted values using last known observation or nominal baseline.
   */
  public imputeMissing(partial: Partial<SensorReading>): SensorReading {
    const fallback = this.lastValidReading || {
      timestamp: Date.now(),
      acc_x: 0,
      acc_y: 0,
      acc_z: 9.81,
      gyro_x: 0,
      gyro_y: 0,
      gyro_z: 0,
      heart_rate: 70,
      muscle_activity: 5,
      joint_angle: 0,
      pressure: 0,
      temperature: 36.5,
    };

    return {
      timestamp: typeof partial.timestamp === 'number' && Number.isFinite(partial.timestamp) ? partial.timestamp : Date.now(),
      acc_x: typeof partial.acc_x === 'number' && Number.isFinite(partial.acc_x) ? partial.acc_x : fallback.acc_x,
      acc_y: typeof partial.acc_y === 'number' && Number.isFinite(partial.acc_y) ? partial.acc_y : fallback.acc_y,
      acc_z: typeof partial.acc_z === 'number' && Number.isFinite(partial.acc_z) ? partial.acc_z : fallback.acc_z,
      gyro_x: typeof partial.gyro_x === 'number' && Number.isFinite(partial.gyro_x) ? partial.gyro_x : fallback.gyro_x,
      gyro_y: typeof partial.gyro_y === 'number' && Number.isFinite(partial.gyro_y) ? partial.gyro_y : fallback.gyro_y,
      gyro_z: typeof partial.gyro_z === 'number' && Number.isFinite(partial.gyro_z) ? partial.gyro_z : fallback.gyro_z,
      heart_rate: typeof partial.heart_rate === 'number' && Number.isFinite(partial.heart_rate) ? partial.heart_rate : fallback.heart_rate,
      muscle_activity: typeof partial.muscle_activity === 'number' && Number.isFinite(partial.muscle_activity) ? partial.muscle_activity : fallback.muscle_activity,
      joint_angle: typeof partial.joint_angle === 'number' && Number.isFinite(partial.joint_angle) ? partial.joint_angle : fallback.joint_angle,
      pressure: typeof partial.pressure === 'number' && Number.isFinite(partial.pressure) ? partial.pressure : fallback.pressure,
      temperature: typeof partial.temperature === 'number' && Number.isFinite(partial.temperature) ? partial.temperature : fallback.temperature,
    };
  }

  /**
   * Clamps sensor reading values to strict physiological & hardware ranges.
   */
  public clampOutliers(reading: SensorReading): SensorReading {
    return {
      timestamp: reading.timestamp,
      acc_x: Math.max(SENSOR_BOUNDS.acc.min, Math.min(SENSOR_BOUNDS.acc.max, reading.acc_x)),
      acc_y: Math.max(SENSOR_BOUNDS.acc.min, Math.min(SENSOR_BOUNDS.acc.max, reading.acc_y)),
      acc_z: Math.max(SENSOR_BOUNDS.acc.min, Math.min(SENSOR_BOUNDS.acc.max, reading.acc_z)),
      gyro_x: Math.max(SENSOR_BOUNDS.gyro.min, Math.min(SENSOR_BOUNDS.gyro.max, reading.gyro_x)),
      gyro_y: Math.max(SENSOR_BOUNDS.gyro.min, Math.min(SENSOR_BOUNDS.gyro.max, reading.gyro_y)),
      gyro_z: Math.max(SENSOR_BOUNDS.gyro.min, Math.min(SENSOR_BOUNDS.gyro.max, reading.gyro_z)),
      heart_rate: Math.max(SENSOR_BOUNDS.heart_rate.min, Math.min(SENSOR_BOUNDS.heart_rate.max, reading.heart_rate)),
      muscle_activity: Math.max(SENSOR_BOUNDS.muscle_activity.min, Math.min(SENSOR_BOUNDS.muscle_activity.max, reading.muscle_activity)),
      joint_angle: Math.max(SENSOR_BOUNDS.joint_angle.min, Math.min(SENSOR_BOUNDS.joint_angle.max, reading.joint_angle)),
      pressure: Math.max(SENSOR_BOUNDS.pressure.min, Math.min(SENSOR_BOUNDS.pressure.max, reading.pressure)),
      temperature: Math.max(SENSOR_BOUNDS.temperature.min, Math.min(SENSOR_BOUNDS.temperature.max, reading.temperature)),
    };
  }

  /**
   * Applies Exponential Moving Average (EMA) to smooth out high-frequency noise
   * while preserving high-velocity kinematic impulses.
   */
  public smooth(reading: SensorReading): SensorReading {
    if (!this.lastValidReading) {
      this.lastValidReading = reading;
      return reading;
    }

    const prev = this.lastValidReading;
    const a = this.emaAlpha;

    const smoothed: SensorReading = {
      timestamp: reading.timestamp,
      // For inertial acceleration, keep fast response (0.75 weight to new value)
      acc_x: Number((prev.acc_x * 0.25 + reading.acc_x * 0.75).toFixed(3)),
      acc_y: Number((prev.acc_y * 0.25 + reading.acc_y * 0.75).toFixed(3)),
      acc_z: Number((prev.acc_z * 0.25 + reading.acc_z * 0.75).toFixed(3)),
      gyro_x: Number((prev.gyro_x * 0.3 + reading.gyro_x * 0.7).toFixed(2)),
      gyro_y: Number((prev.gyro_y * 0.3 + reading.gyro_y * 0.7).toFixed(2)),
      gyro_z: Number((prev.gyro_z * 0.3 + reading.gyro_z * 0.7).toFixed(2)),
      // Heart rate has lower frequency dynamics; smooth with alpha = 0.2
      heart_rate: Math.round(prev.heart_rate * 0.8 + reading.heart_rate * 0.2),
      muscle_activity: Number((prev.muscle_activity * (1 - a) + reading.muscle_activity * a).toFixed(1)),
      joint_angle: Number((prev.joint_angle * (1 - a) + reading.joint_angle * a).toFixed(1)),
      pressure: Number((prev.pressure * (1 - a) + reading.pressure * a).toFixed(1)),
      temperature: Number((prev.temperature * 0.95 + reading.temperature * 0.05).toFixed(2)),
    };

    this.lastValidReading = smoothed;
    return smoothed;
  }

  /**
   * Full cleaning pipeline: Impute -> Clamp -> Smooth.
   */
  public clean(raw: Partial<SensorReading>): SensorReading {
    const imputed = this.imputeMissing(raw);
    const clamped = this.clampOutliers(imputed);
    return this.smooth(clamped);
  }
}

export const defaultDataCleaner = new DataCleaner();
