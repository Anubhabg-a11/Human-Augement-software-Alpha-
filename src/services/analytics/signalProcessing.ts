import { SensorReading } from '../../types';

export class SignalProcessor {
  /**
   * Computes Euclidean magnitude of a 3D vector: sqrt(x^2 + y^2 + z^2)
   */
  public static calculateVectorMagnitude(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Calculates scalar magnitude of 3-axis acceleration vector.
   */
  public static calculateAccelerationMagnitude(reading: SensorReading): number {
    return Number(
      this.calculateVectorMagnitude(reading.acc_x, reading.acc_y, reading.acc_z).toFixed(3)
    );
  }

  /**
   * Isolates dynamic acceleration by subtracting standard gravitational 1G (9.81 m/s²).
   */
  public static calculateDynamicAcceleration(reading: SensorReading): number {
    const totalMag = this.calculateAccelerationMagnitude(reading);
    return Math.max(0, Math.abs(totalMag - 9.81));
  }

  /**
   * Computes scalar magnitude of 3-axis gyroscope angular velocity (°/s).
   */
  public static calculateAngularVelocityMagnitude(reading: SensorReading): number {
    return Number(
      this.calculateVectorMagnitude(reading.gyro_x, reading.gyro_y, reading.gyro_z).toFixed(2)
    );
  }

  /**
   * Computes kinematic jerk magnitude: da / dt between two consecutive readings.
   */
  public static calculateJerk(curr: SensorReading, prev: SensorReading): number {
    const dtSeconds = Math.max(0.01, (curr.timestamp - prev.timestamp) / 1000);
    const dAx = (curr.acc_x - prev.acc_x) / dtSeconds;
    const dAy = (curr.acc_y - prev.acc_y) / dtSeconds;
    const dAz = (curr.acc_z - prev.acc_z) / dtSeconds;
    return Number(this.calculateVectorMagnitude(dAx, dAy, dAz).toFixed(2));
  }

  /**
   * Computes Root Mean Square (RMS) of an array of numbers.
   */
  public static calculateRMS(values: number[]): number {
    if (values.length === 0) return 0;
    const sumSquares = values.reduce((acc, val) => acc + val * val, 0);
    return Number(Math.sqrt(sumSquares / values.length).toFixed(2));
  }

  /**
   * Computes arithmetic mean of an array of numbers.
   */
  public static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Number((sum / values.length).toFixed(2));
  }

  /**
   * Computes standard deviation of an array of numbers.
   */
  public static calculateStdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = this.calculateMean(values);
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1);
    return Number(Math.sqrt(variance).toFixed(2));
  }
}
