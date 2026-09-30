import { PostureStatus, SensorReading } from '../../types';
import { PostureAnalysisResult } from './types';

export class PostureAnalyzer {
  private cumulativeHighRiskSeconds: number = 0;
  private sustainedAwkwardCounter: number = 0;
  private repetitivePostureCycles: number = 0;
  private prevFlexionHigh: boolean = false;

  public reset(): void {
    this.cumulativeHighRiskSeconds = 0;
    this.sustainedAwkwardCounter = 0;
    this.repetitivePostureCycles = 0;
    this.prevFlexionHigh = false;
  }

  /**
   * Evaluates instantaneous joint angle based on ISO 11226 / REBA ergonomic benchmarks:
   *   0° – 20°: Safe neutral posture
   *  21° – 45°: Attention / Mild strain
   *   > 45°: High risk / Severe musculoskeletal disc compression
   */
  public evaluateInstantAngle(angle: number): {
    score: number;
    status: PostureStatus;
    statusUpper: 'SAFE' | 'ATTENTION' | 'HIGH RISK';
  } {
    const absAngle = Math.abs(angle);
    let status: PostureStatus = 'safe';
    let statusUpper: 'SAFE' | 'ATTENTION' | 'HIGH RISK' = 'SAFE';
    let score = 0;

    if (absAngle <= 20) {
      status = 'safe';
      statusUpper = 'SAFE';
      score = (absAngle / 20) * 25; // 0 - 25
    } else if (absAngle <= 45) {
      status = 'attention';
      statusUpper = 'ATTENTION';
      score = 25 + ((absAngle - 20) / 25) * 45; // 26 - 70
    } else {
      status = 'high_risk';
      statusUpper = 'HIGH RISK';
      score = 70 + Math.min(30, ((absAngle - 45) / 45) * 30); // 71 - 100
    }

    return {
      score: Math.round(score),
      status,
      statusUpper,
    };
  }

  /**
   * Analyzes posture over temporal window including sustained duration and repetition
   */
  public analyze(
    window: SensorReading[],
    samplingRateHz: number = 10
  ): PostureAnalysisResult {
    if (window.length === 0) {
      return {
        jointAngle: 0,
        status: 'safe',
        statusUpper: 'SAFE',
        score: 0,
        timeSpentOutsideSafeRangeSeconds: 0,
        repetitivePostureEvents: 0,
        sustainedAwkwardExposure: false,
        iso11226RiskTier: 'Acceptable',
      };
    }

    const latest = window[window.length - 1];
    const instant = this.evaluateInstantAngle(latest.joint_angle);

    // Track repetitive posture flexion cycles (>35° cycle)
    const isFlexed = Math.abs(latest.joint_angle) > 35;
    if (isFlexed && !this.prevFlexionHigh) {
      this.repetitivePostureCycles++;
      this.prevFlexionHigh = true;
    } else if (!isFlexed && Math.abs(latest.joint_angle) < 15) {
      this.prevFlexionHigh = false;
    }

    // Cumulative time outside safe range (>20°)
    if (Math.abs(latest.joint_angle) > 20) {
      this.cumulativeHighRiskSeconds += 1 / Math.max(1, samplingRateHz);
      this.sustainedAwkwardCounter++;
    } else {
      this.sustainedAwkwardCounter = Math.max(0, this.sustainedAwkwardCounter - 1);
    }

    // Window sustained fraction: Awkward posture for >40% of window
    const outsideCount = window.filter(r => Math.abs(r.joint_angle) > 20).length;
    const windowOutsideFraction = outsideCount / window.length;

    let adjustedScore = instant.score;
    let sustainedAwkwardExposure = false;

    // Amplification for sustained exposure
    if (windowOutsideFraction > 0.4) {
      sustainedAwkwardExposure = true;
      adjustedScore = Math.min(100, adjustedScore + Math.round(windowOutsideFraction * 18));
    }

    // Map final adjusted score to output tier
    let finalStatus: PostureStatus = instant.status;
    let finalStatusUpper: 'SAFE' | 'ATTENTION' | 'HIGH RISK' = instant.statusUpper;
    let isoTier: 'Acceptable' | 'Conditionally Acceptable' | 'Not Recommended' = 'Acceptable';

    if (adjustedScore >= 70 || Math.abs(latest.joint_angle) > 45) {
      finalStatus = 'high_risk';
      finalStatusUpper = 'HIGH RISK';
      isoTier = 'Not Recommended';
    } else if (adjustedScore >= 30 || Math.abs(latest.joint_angle) > 20) {
      finalStatus = 'attention';
      finalStatusUpper = 'ATTENTION';
      isoTier = 'Conditionally Acceptable';
    } else {
      finalStatus = 'safe';
      finalStatusUpper = 'SAFE';
      isoTier = 'Acceptable';
    }

    return {
      jointAngle: Number(latest.joint_angle.toFixed(1)),
      status: finalStatus,
      statusUpper: finalStatusUpper,
      score: Math.round(adjustedScore),
      timeSpentOutsideSafeRangeSeconds: Math.round(this.cumulativeHighRiskSeconds),
      repetitivePostureEvents: this.repetitivePostureCycles,
      sustainedAwkwardExposure,
      iso11226RiskTier: isoTier,
    };
  }
}

export const defaultPostureAnalyzer = new PostureAnalyzer();
