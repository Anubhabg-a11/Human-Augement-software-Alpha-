import { ActivityType, FatigueLevel, PostureStatus, RiskLevel } from '../../types';

export interface RecommendationInputs {
  fatigueLevel: FatigueLevel;
  fatigueScore: number;
  postureStatus: PostureStatus;
  jointAngle: number;
  physicalLoadKg: number;
  overallRisk: RiskLevel;
  activityType: ActivityType;
  abnormalMovementCount: number;
  sustainedAwkwardExposure: boolean;
}

export class RecommendationGenerator {
  /**
   * Generates prioritized ergonomic recommendations based on real-time biomechanical analysis.
   */
  public generate(inputs: RecommendationInputs): {
    primaryAction: string;
    actionItems: string[];
    priority: 'Routine' | 'Attention' | 'Urgent';
  } {
    const {
      fatigueLevel,
      postureStatus,
      jointAngle,
      physicalLoadKg,
      overallRisk,
      activityType,
      abnormalMovementCount,
      sustainedAwkwardExposure,
    } = inputs;

    const actionItems: string[] = [];
    let priority: 'Routine' | 'Attention' | 'Urgent' = 'Routine';
    let primaryAction = 'Maintain standard operational pacing and hydration.';

    // Priority 1: High Overall Risk or Critical Posture/Fatigue
    if (overallRisk === 'high' || postureStatus === 'high_risk' || fatigueLevel === 'high') {
      priority = 'Urgent';

      if (postureStatus === 'high_risk') {
        primaryAction = `Correct spinal flexion angle immediately (${jointAngle.toFixed(0)}° exceeds 45° safety limit). Elevate work platform or request lifting assist.`;
        actionItems.push('Adjust workstation staging height by 15–20 cm to minimize lumbar moment arm.');
      } else if (fatigueLevel === 'high') {
        primaryAction = 'Mandatory 10-minute active recovery pause. Relieve musculoskeletal spinal loading.';
        actionItems.push('Operator has reached fatigue ceiling. Stand down from heavy handling tasks.');
      } else {
        primaryAction = 'High multi-signal ergonomic risk detected. Immediate task rotation recommended.';
      }

      if (physicalLoadKg > 25) {
        actionItems.push(`Payload of ${physicalLoadKg.toFixed(1)} kg exceeds single-worker lift limit. Use team lifting or mechanical hoists.`);
      }
    } else if (overallRisk === 'moderate' || postureStatus === 'attention' || fatigueLevel === 'moderate') {
      priority = 'Attention';

      if (postureStatus === 'attention') {
        primaryAction = `Observe posture symmetry. Trunk flexion angle (${jointAngle.toFixed(0)}°) is within caution zone (21°–45°).`;
        actionItems.push('Reposition reach zone to maintain neutral spinal curve (under 20° flexion).');
      } else if (fatigueLevel === 'moderate') {
        primaryAction = 'Fatigue index elevated. Schedule ergonomic task rotation within next 15 minutes.';
        actionItems.push('Incorporate 60-second micro-breaks every 20 lifting cycles.');
      }

      if (sustainedAwkwardExposure) {
        actionItems.push('Worker has maintained static forward bend for prolonged duration. Encourage extension stretches.');
      }
    } else {
      // Nominal routine state
      priority = 'Routine';
      if (activityType === 'recovery') {
        primaryAction = 'Active physiological recovery in progress. Heart rate and muscle EMG stabilizing.';
      } else if (activityType === 'rest') {
        primaryAction = 'Ergonomic baseline calibration mode. Signals nominal.';
      } else {
        primaryAction = 'Ergonomic indicators within acceptable ISO 11226 guidelines. Continue safe handling cadence.';
      }
    }

    if (abnormalMovementCount > 3) {
      actionItems.push('Multiple kinematic deceleration spikes detected. Check for slippery footing or unstable load grip.');
    }

    return {
      primaryAction,
      actionItems,
      priority,
    };
  }
}

export const defaultRecommendationGenerator = new RecommendationGenerator();
