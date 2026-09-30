import { SensorReading } from '../../types';
import { PhysicalLoadResult } from './types';

export class PhysicalLoadAnalyzer {
  private defaultMaxPermissibleKg: number = 25; // Standard NIOSH ergonomic limit

  constructor(defaultMaxPermissibleKg: number = 25) {
    this.defaultMaxPermissibleKg = defaultMaxPermissibleKg;
  }

  /**
   * Analyzes physical external load and localized musculoskeletal force demand
   */
  public analyze(
    reading: SensorReading,
    window: SensorReading[],
    customLimitKg?: number
  ): PhysicalLoadResult {
    const limit = customLimitKg || this.defaultMaxPermissibleKg;
    const currentLoad = Math.max(0, reading.pressure);

    const loads = window.length > 0 ? window.map(r => Math.max(0, r.pressure)) : [currentLoad];
    const meanLoad = Number((loads.reduce((a, b) => a + b, 0) / loads.length).toFixed(1));
    const peakLoad = Number(Math.max(...loads).toFixed(1));

    // Score 0-100: scaled relative to permissible limit
    const loadRatio = currentLoad / limit;
    const loadRiskScore = Math.min(100, Math.max(0, Math.round(loadRatio * 75)));

    const exceedsPermissibleLimit = currentLoad > limit;

    let musculoskeletalDemand: 'Low' | 'Moderate' | 'Heavy' | 'Hazardous' = 'Low';
    if (currentLoad > limit * 1.2 || loadRiskScore >= 80) {
      musculoskeletalDemand = 'Hazardous';
    } else if (currentLoad > limit || loadRiskScore >= 60) {
      musculoskeletalDemand = 'Heavy';
    } else if (currentLoad > limit * 0.4 || loadRiskScore >= 30) {
      musculoskeletalDemand = 'Moderate';
    }

    return {
      currentLoadKg: Number(currentLoad.toFixed(1)),
      meanLoadKg: meanLoad,
      peakLoadKg: peakLoad,
      loadRiskScore,
      exceedsPermissibleLimit,
      guidelineMaxKg: limit,
      musculoskeletalDemand,
    };
  }
}

export const defaultPhysicalLoadAnalyzer = new PhysicalLoadAnalyzer();
