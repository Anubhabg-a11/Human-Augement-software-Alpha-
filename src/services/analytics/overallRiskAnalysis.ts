import { RiskLevel } from '../../types';
import { OverallRiskResult } from './types';

export interface OverallRiskInputs {
  fatigueScore: number; // 0-100
  postureScore: number; // 0-100
  movementScore: number; // 0-100 (smoothness, 100 = best)
  physicalLoadKg: number;
  permissibleLoadLimitKg?: number;
}

export class OverallRiskAnalyzer {
  public static readonly MODEL_LABEL = 'Prototype Analytical Model';

  /**
   * Combines Fatigue (30%), Posture (30%), Movement Quality (20%), and Physical Load (20%)
   * Formulates a transparent, explainable composite index with non-diagnostic disclaimer.
   */
  public analyze(inputs: OverallRiskInputs): OverallRiskResult {
    const {
      fatigueScore,
      postureScore,
      movementScore,
      physicalLoadKg,
      permissibleLoadLimitKg = 25,
    } = inputs;

    // Movement risk is inverted: lower smoothness/quality = higher risk
    const movementRisk = 100 - movementScore;

    // Physical load risk scaled against permissible lift threshold
    const loadRisk = Math.min(100, Math.round((physicalLoadKg / permissibleLoadLimitKg) * 75));

    // Composite weighted score: 30% Fatigue + 30% Posture + 20% Movement Risk + 20% Load Risk
    const compositeScore = Math.round(
      fatigueScore * 0.30 +
      postureScore * 0.30 +
      movementRisk * 0.20 +
      loadRisk * 0.20
    );

    const boundedScore = Math.min(100, Math.max(0, compositeScore));

    let level: RiskLevel = 'low';
    let levelUpper: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';

    if (boundedScore <= 35) {
      level = 'low';
      levelUpper = 'LOW';
    } else if (boundedScore <= 68) {
      level = 'moderate';
      levelUpper = 'MODERATE';
    } else {
      level = 'high';
      levelUpper = 'HIGH';
    }

    // Explainable contributors
    const contributors: string[] = [];
    if (fatigueScore >= 60) {
      contributors.push(`Elevated cumulative fatigue score (${fatigueScore}/100)`);
    }
    if (postureScore >= 50) {
      contributors.push(`Non-neutral joint flexion exposure (${postureScore}/100)`);
    }
    if (movementRisk >= 40) {
      contributors.push('Kinematic jerk spikes or erratic deceleration patterns detected');
    }
    if (physicalLoadKg > permissibleLoadLimitKg) {
      contributors.push(`Handled physical load (${physicalLoadKg.toFixed(1)} kg) exceeds standard guideline (${permissibleLoadLimitKg} kg)`);
    } else if (loadRisk >= 50) {
      contributors.push(`External physical load of ${physicalLoadKg.toFixed(1)} kg approaching guideline limits`);
    }
    if (contributors.length === 0) {
      contributors.push('Biomechanical indicators within nominal ergonomic tolerance');
    }

    const confidenceNote =
      'Confidence: Engineering decision-support heuristic (Rule-Based Prototype Analytical Model). Notice: Non-diagnostic tool for workplace safety and ergonomics pacing.';

    return {
      score: boundedScore,
      level,
      levelUpper,
      contributors,
      confidenceNote,
      modelDesignation: OverallRiskAnalyzer.MODEL_LABEL,
    };
  }
}

export const defaultOverallRiskAnalyzer = new OverallRiskAnalyzer();
