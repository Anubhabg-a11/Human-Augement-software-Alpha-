import { ActivityType, FatigueLevel } from '../../types';
import { FatigueAnalysisResult } from './types';

export interface FatigueModelInputs {
  heartRate: number;
  heartRateLoad: number; // 0-100
  muscleActivity: number; // 0-100 (% MVC)
  movementIntensity: number; // 0-100
  continuousActivityDurationSeconds: number; // continuous work time
  recoveryDurationSeconds?: number; // recovery time
  activityType: ActivityType;
}

export class FatigueAnalyzer {
  private previousScore: number = 20;

  public reset(): void {
    this.previousScore = 20;
  }

  /**
   * Explainable Fatigue Estimation Model (Prototype Analytical Model)
   *
   * Formulated based on exercise physiology & industrial ergonomics:
   *   1. Cardiovascular Load (Heart Rate Reserve) - 28%
   *   2. Sustained Muscular Recruitment (EMG % MVC) - 28%
   *   3. Movement Intensity & Dynamic Pacing - 18%
   *   4. Continuous Exposure Duration Accumulation - 16%
   *   5. Recovery Behavior Benefit - -10% credit
   */
  public analyze(inputs: FatigueModelInputs): FatigueAnalysisResult {
    const {
      heartRateLoad,
      muscleActivity,
      movementIntensity,
      continuousActivityDurationSeconds,
      recoveryDurationSeconds = 0,
      activityType,
    } = inputs;

    // 1. Duration accumulation penalty (0 - 15 points)
    // 0-30 min: small buildup; >60 min: continuous fatigue buildup
    const durationMinutes = continuousActivityDurationSeconds / 60;
    const durationPenalty = Math.min(15, Math.round((durationMinutes / 45) * 15));

    // 2. Recovery behavior credit (-0 to -20 points)
    const recoveryMinutes = recoveryDurationSeconds / 60;
    const recoveryCredit = activityType === 'recovery' || activityType === 'rest'
      ? Math.min(20, Math.round((recoveryMinutes / 10) * 20) + 5)
      : 0;

    // Multi-signal linear fusion
    const rawWeighted =
      heartRateLoad * 0.28 +
      muscleActivity * 0.28 +
      movementIntensity * 0.18 +
      durationPenalty -
      recoveryCredit;

    const boundedScore = Math.min(100, Math.max(0, Math.round(rawWeighted)));

    // Categorization
    let level: FatigueLevel = 'low';
    let levelUpper: 'LOW' | 'MILD' | 'MODERATE' | 'HIGH' = 'LOW';

    if (boundedScore <= 25) {
      level = 'low';
      levelUpper = 'LOW';
    } else if (boundedScore <= 50) {
      level = 'mild';
      levelUpper = 'MILD';
    } else if (boundedScore <= 75) {
      level = 'moderate';
      levelUpper = 'MODERATE';
    } else {
      level = 'high';
      levelUpper = 'HIGH';
    }

    // Trend calculation
    let trend: 'increasing' | 'stable' | 'recovering' = 'stable';
    if (boundedScore > this.previousScore + 2) {
      trend = 'increasing';
    } else if (boundedScore < this.previousScore - 2 || activityType === 'recovery') {
      trend = 'recovering';
    }
    this.previousScore = boundedScore;

    // Transparent, explainable contributor breakdown
    const contributors: string[] = [];
    if (heartRateLoad > 60) {
      contributors.push(`Elevated cardiovascular reserve utilization (${heartRateLoad}%)`);
    }
    if (muscleActivity > 50) {
      contributors.push(`Sustained electromyographic muscle recruitment (${muscleActivity.toFixed(0)}% MVC)`);
    }
    if (movementIntensity > 65) {
      contributors.push(`High kinematic intensity and velocity (${movementIntensity}%)`);
    }
    if (durationPenalty >= 10) {
      contributors.push(`Prolonged continuous work duration (${Math.round(durationMinutes)} minutes without ergonomic pause)`);
    }
    if (recoveryCredit > 0) {
      contributors.push(`Active biological recovery pace detected (-${recoveryCredit} pts credit)`);
    }
    if (contributors.length === 0) {
      contributors.push('Physiological and biomechanical signals in homeostatic equilibrium');
    }

    // Contextual recommendation
    let recommendation = 'Nominal metabolic status. Maintain regular task cadence.';
    if (level === 'high') {
      recommendation = 'Mandatory 10-minute active recovery pause. Relieve musculoskeletal loading.';
    } else if (level === 'moderate') {
      recommendation = 'Workload approaching fatigue limit. Schedule task rotation within 15 minutes.';
    } else if (level === 'mild') {
      recommendation = 'Acceptable operational strain. Observe symmetrical body posture.';
    }

    return {
      score: boundedScore,
      level,
      levelUpper,
      contributors,
      trend,
      recommendation,
      weights: {
        hrLoadWeight: 0.28,
        muscleActivityWeight: 0.28,
        physicalLoadWeight: 0.0, // Handled in physical load module, incorporated in overall
        intensityWeight: 0.18,
        durationPenalty,
        recoveryCredit,
      },
    };
  }
}

export const defaultFatigueAnalyzer = new FatigueAnalyzer();
