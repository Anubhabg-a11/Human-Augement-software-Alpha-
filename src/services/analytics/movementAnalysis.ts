import { SensorReading } from '../../types';
import { calculateMovementIntensity, calculateRepetitiveMovementCount } from './featureExtraction';
import { SignalProcessor } from './signalProcessing';
import { MovementAnalysisResult } from './types';

export class MovementAnalyzer {
  private cumulativeRepetitions: number = 0;
  private cumulativeAbnormalEvents: number = 0;
  private prevJointAnglePeak: boolean = false;

  public reset(): void {
    this.cumulativeRepetitions = 0;
    this.cumulativeAbnormalEvents = 0;
    this.prevJointAnglePeak = false;
  }

  /**
   * Tracks incremental cyclic repetitions via hysteresis peak-valley detector
   */
  public updateRepetitionCounter(jointAngle: number): number {
    const absAngle = Math.abs(jointAngle);
    if (absAngle > 35 && !this.prevJointAnglePeak) {
      this.cumulativeRepetitions++;
      this.prevJointAnglePeak = true;
    } else if (absAngle < 15 && this.prevJointAnglePeak) {
      this.prevJointAnglePeak = false;
    }
    return this.cumulativeRepetitions;
  }

  /**
   * Analyzes movement metrics across temporal window
   */
  public analyze(window: SensorReading[]): MovementAnalysisResult {
    if (window.length < 2) {
      return {
        movementIntensity: 10,
        movementConsistency: 95,
        abnormalMovementEvents: this.cumulativeAbnormalEvents,
        repetitionCount: this.cumulativeRepetitions,
        movementQuality: 90,
        movementScore: 90,
        meanJerk: 0.5,
      };
    }

    const intensity = calculateMovementIntensity(window);

    // Jerk and kinematic anomaly detection
    let totalJerk = 0;
    let windowAnomalies = 0;
    const dynamicAccValues: number[] = [];

    for (let i = 1; i < window.length; i++) {
      const prev = window[i - 1];
      const curr = window[i];
      const jerk = SignalProcessor.calculateJerk(curr, prev);
      totalJerk += jerk;

      const dynamicAcc = SignalProcessor.calculateDynamicAcceleration(curr);
      dynamicAccValues.push(dynamicAcc);

      // Anomaly threshold: sudden mechanical impact/slip shock (>45 m/s³) or extreme rapid twist (>120 deg/s)
      const gyroDeltaZ = Math.abs(curr.gyro_z - prev.gyro_z);
      if (jerk > 45 || gyroDeltaZ > 120) {
        windowAnomalies++;
      }
    }

    if (windowAnomalies > 0) {
      this.cumulativeAbnormalEvents += windowAnomalies;
    }

    const meanJerk = Number((totalJerk / (window.length - 1)).toFixed(2));

    // Movement consistency: coefficient of variation of dynamic acceleration
    const meanDynAcc = SignalProcessor.calculateMean(dynamicAccValues);
    const stdDevDynAcc = SignalProcessor.calculateStdDev(dynamicAccValues);
    const cov = meanDynAcc > 0 ? (stdDevDynAcc / meanDynAcc) : 0;
    // Lower CoV means higher consistency
    const consistencyScore = Math.max(10, Math.min(100, Math.round(100 - cov * 35)));

    // Movement quality (0-100): High score = controlled, fluid ergonomic motion
    // Jerk penalty scaled gently so normal bipedal gait (~15-25 m/s³) remains fluid and ergonomic
    const jerkPenalty = Math.min(30, meanJerk * 0.9);
    const anomalyPenalty = Math.min(40, windowAnomalies * 15);
    const qualityScore = Math.max(15, Math.min(98, Math.round(100 - jerkPenalty - anomalyPenalty)));

    // Keep cumulative repetitions updated
    const latest = window[window.length - 1];
    this.updateRepetitionCounter(latest.joint_angle);

    return {
      movementIntensity: intensity,
      movementConsistency: consistencyScore,
      abnormalMovementEvents: this.cumulativeAbnormalEvents,
      repetitionCount: this.cumulativeRepetitions,
      movementQuality: qualityScore,
      movementScore: qualityScore, // Alias for backward compatibility
      meanJerk,
    };
  }
}

export const defaultMovementAnalyzer = new MovementAnalyzer();
