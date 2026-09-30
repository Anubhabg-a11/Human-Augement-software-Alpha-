import { SensorReading } from '../../types';
import { ValidationIssue, ValidationResult } from './types';

// Physiological and sensor hardware operational limits
export const SENSOR_BOUNDS = {
  heart_rate: { min: 30, max: 240 }, // BPM
  joint_angle: { min: -180, max: 180 }, // degrees (flexion/extension)
  acc: { min: -200, max: 200 }, // m/s² (typical 16G IMU max ~156 m/s²)
  gyro: { min: -2000, max: 2000 }, // °/s (typical 2000 dps gyroscope)
  muscle_activity: { min: 0, max: 200 }, // % MVC
  pressure: { min: 0, max: 300 }, // kg force equivalent
  temperature: { min: 15, max: 50 }, // °C skin surface temperature
};

export class SensorValidator {
  private lastTimestamp: number = 0;
  private lastReadingHash: string = '';

  public reset(): void {
    this.lastTimestamp = 0;
    this.lastReadingHash = '';
  }

  /**
   * Validates a raw sensor payload with full boundary, type, and temporal checking.
   */
  public validate(raw: unknown): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. Malformed request / non-object check
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      issues.push({
        field: 'payload',
        code: 'MISSING_FIELD',
        message: 'Sensor reading payload must be a non-null JSON object.',
        rawValue: raw,
      });
      return {
        isValid: false,
        issues,
        sanitized: null,
        isDuplicate: false,
        hasOutliers: false,
      };
    }

    const obj = raw as Record<string, unknown>;

    // 2. Missing field checks
    const requiredNumericFields: (keyof SensorReading)[] = [
      'acc_x',
      'acc_y',
      'acc_z',
      'gyro_x',
      'gyro_y',
      'gyro_z',
      'heart_rate',
      'muscle_activity',
      'joint_angle',
      'pressure',
      'temperature',
    ];

    for (const field of requiredNumericFields) {
      if (obj[field] === undefined || obj[field] === null) {
        issues.push({
          field,
          code: 'MISSING_FIELD',
          message: `Required sensor field '${field}' is missing.`,
          rawValue: obj[field],
        });
      }
    }

    // 3. Numeric & NaN/Infinity validation
    const parsedValues: Partial<SensorReading> = {};
    for (const field of requiredNumericFields) {
      const val = obj[field];
      if (val !== undefined && val !== null) {
        const num = Number(val);
        if (Number.isNaN(num) || !Number.isFinite(num)) {
          issues.push({
            field,
            code: 'NAN_OR_INFINITY',
            message: `Field '${field}' contains non-finite or NaN numeric representation.`,
            rawValue: val,
          });
        } else {
          parsedValues[field] = num;
        }
      }
    }

    // 4. Timestamp Validation
    let rawTimestamp = obj.timestamp;
    if (rawTimestamp === undefined || rawTimestamp === null) {
      rawTimestamp = Date.now();
      issues.push({
        field: 'timestamp',
        code: 'MISSING_FIELD',
        message: 'Timestamp missing; auto-assigned current local epoch time.',
        rawValue: undefined,
      });
    }

    const timestampNum = Number(rawTimestamp);
    const now = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const YEAR_2020_MS = 1577836800000;

    let isDuplicate = false;

    if (Number.isNaN(timestampNum) || !Number.isFinite(timestampNum)) {
      issues.push({
        field: 'timestamp',
        code: 'NOT_NUMERIC',
        message: 'Timestamp must be a valid numeric millisecond epoch.',
        rawValue: rawTimestamp,
      });
    } else if (timestampNum < YEAR_2020_MS) {
      issues.push({
        field: 'timestamp',
        code: 'IMPOSSIBLE_RANGE',
        message: 'Timestamp predates system epoch boundary (Year 2020).',
        rawValue: timestampNum,
      });
    } else if (timestampNum > now + FIVE_MINUTES_MS) {
      issues.push({
        field: 'timestamp',
        code: 'FUTURE_TIMESTAMP',
        message: 'Timestamp is in the far future (>5 minutes beyond gateway clock).',
        rawValue: timestampNum,
      });
    } else if (timestampNum === this.lastTimestamp) {
      isDuplicate = true;
      issues.push({
        field: 'timestamp',
        code: 'DUPLICATE_TIMESTAMP',
        message: `Duplicate timestamp received (${timestampNum} ms).`,
        rawValue: timestampNum,
      });
    } else if (this.lastTimestamp > 0 && timestampNum < this.lastTimestamp) {
      issues.push({
        field: 'timestamp',
        code: 'OUT_OF_ORDER_TIMESTAMP',
        message: `Temporal inversion: reading timestamp ${timestampNum} is prior to preceding ${this.lastTimestamp}.`,
        rawValue: timestampNum,
      });
    }

    // 5. Impossible ranges check
    let hasOutliers = false;

    const checkBound = (field: keyof SensorReading, val: number | undefined, min: number, max: number) => {
      if (val !== undefined) {
        if (val < min || val > max) {
          hasOutliers = true;
          issues.push({
            field,
            code: 'IMPOSSIBLE_RANGE',
            message: `Value ${val} for '${field}' is outside physiological/sensor boundary [${min}, ${max}].`,
            rawValue: val,
          });
        }
      }
    };

    checkBound('heart_rate', parsedValues.heart_rate, SENSOR_BOUNDS.heart_rate.min, SENSOR_BOUNDS.heart_rate.max);
    checkBound('joint_angle', parsedValues.joint_angle, SENSOR_BOUNDS.joint_angle.min, SENSOR_BOUNDS.joint_angle.max);
    checkBound('acc_x', parsedValues.acc_x, SENSOR_BOUNDS.acc.min, SENSOR_BOUNDS.acc.max);
    checkBound('acc_y', parsedValues.acc_y, SENSOR_BOUNDS.acc.min, SENSOR_BOUNDS.acc.max);
    checkBound('acc_z', parsedValues.acc_z, SENSOR_BOUNDS.acc.min, SENSOR_BOUNDS.acc.max);
    checkBound('gyro_x', parsedValues.gyro_x, SENSOR_BOUNDS.gyro.min, SENSOR_BOUNDS.gyro.max);
    checkBound('gyro_y', parsedValues.gyro_y, SENSOR_BOUNDS.gyro.min, SENSOR_BOUNDS.gyro.max);
    checkBound('gyro_z', parsedValues.gyro_z, SENSOR_BOUNDS.gyro.min, SENSOR_BOUNDS.gyro.max);
    checkBound('muscle_activity', parsedValues.muscle_activity, SENSOR_BOUNDS.muscle_activity.min, SENSOR_BOUNDS.muscle_activity.max);
    checkBound('pressure', parsedValues.pressure, SENSOR_BOUNDS.pressure.min, SENSOR_BOUNDS.pressure.max);
    checkBound('temperature', parsedValues.temperature, SENSOR_BOUNDS.temperature.min, SENSOR_BOUNDS.temperature.max);

    // Duplicate vector check
    const readingHash = `${parsedValues.acc_x}_${parsedValues.acc_y}_${parsedValues.acc_z}_${parsedValues.heart_rate}_${parsedValues.joint_angle}`;
    if (readingHash === this.lastReadingHash && this.lastReadingHash !== '') {
      isDuplicate = true;
    }

    const fatalErrors = issues.filter(
      i => i.code === 'MISSING_FIELD' || i.code === 'NAN_OR_INFINITY' || i.code === 'NOT_NUMERIC'
    );

    const isValid = fatalErrors.length === 0;

    // Build sanitized fallback if valid
    let sanitized: SensorReading | null = null;
    if (isValid) {
      sanitized = {
        timestamp: Number.isFinite(timestampNum) && timestampNum >= YEAR_2020_MS ? timestampNum : Date.now(),
        acc_x: Math.max(SENSOR_BOUNDS.acc.min, Math.min(SENSOR_BOUNDS.acc.max, parsedValues.acc_x ?? 0)),
        acc_y: Math.max(SENSOR_BOUNDS.acc.min, Math.min(SENSOR_BOUNDS.acc.max, parsedValues.acc_y ?? 0)),
        acc_z: Math.max(SENSOR_BOUNDS.acc.min, Math.min(SENSOR_BOUNDS.acc.max, parsedValues.acc_z ?? 9.81)),
        gyro_x: Math.max(SENSOR_BOUNDS.gyro.min, Math.min(SENSOR_BOUNDS.gyro.max, parsedValues.gyro_x ?? 0)),
        gyro_y: Math.max(SENSOR_BOUNDS.gyro.min, Math.min(SENSOR_BOUNDS.gyro.max, parsedValues.gyro_y ?? 0)),
        gyro_z: Math.max(SENSOR_BOUNDS.gyro.min, Math.min(SENSOR_BOUNDS.gyro.max, parsedValues.gyro_z ?? 0)),
        heart_rate: Math.max(SENSOR_BOUNDS.heart_rate.min, Math.min(SENSOR_BOUNDS.heart_rate.max, parsedValues.heart_rate ?? 70)),
        muscle_activity: Math.max(SENSOR_BOUNDS.muscle_activity.min, Math.min(SENSOR_BOUNDS.muscle_activity.max, parsedValues.muscle_activity ?? 5)),
        joint_angle: Math.max(SENSOR_BOUNDS.joint_angle.min, Math.min(SENSOR_BOUNDS.joint_angle.max, parsedValues.joint_angle ?? 0)),
        pressure: Math.max(SENSOR_BOUNDS.pressure.min, Math.min(SENSOR_BOUNDS.pressure.max, parsedValues.pressure ?? 0)),
        temperature: Math.max(SENSOR_BOUNDS.temperature.min, Math.min(SENSOR_BOUNDS.temperature.max, parsedValues.temperature ?? 36.5)),
      };

      this.lastTimestamp = sanitized.timestamp;
      this.lastReadingHash = readingHash;
    }

    return {
      isValid,
      issues,
      sanitized,
      isDuplicate,
      hasOutliers,
    };
  }
}

export const defaultSensorValidator = new SensorValidator();
