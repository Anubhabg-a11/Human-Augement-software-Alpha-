import { HardwareSensorPayload, SensorReading } from '../types';
import { SENSOR_BOUNDS } from './analytics/sensorValidation';

/**
 * Standard Hardware Integration Protocol
 * Bridges ESP32/IoT Microcontrollers and the HumanAugment AI Analytics Platform.
 */

export const HARDWARE_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'HumanAugment_Wearable_Payload',
  type: 'object',
  required: [
    'deviceId',
    'timestamp',
    'sequenceNumber',
    'accelerometer',
    'gyroscope',
    'heartRate',
    'muscleActivity',
    'jointAngle',
    'pressure',
    'temperature',
  ],
  properties: {
    deviceId: { type: 'string', minLength: 3, description: 'Unique device identifier (e.g. ESP32-BIO-01)' },
    timestamp: { type: 'integer', minimum: 1577836800000, description: 'Unix epoch timestamp in milliseconds' },
    sequenceNumber: { type: 'integer', minimum: 0, description: 'Monotonically increasing packet sequence counter' },
    accelerometer: {
      type: 'object',
      required: ['x', 'y', 'z'],
      properties: {
        x: { type: 'number', minimum: -200, maximum: 200, description: 'Linear acceleration X (m/s²)' },
        y: { type: 'number', minimum: -200, maximum: 200, description: 'Linear acceleration Y (m/s²)' },
        z: { type: 'number', minimum: -200, maximum: 200, description: 'Linear acceleration Z (m/s²)' },
      },
    },
    gyroscope: {
      type: 'object',
      required: ['x', 'y', 'z'],
      properties: {
        x: { type: 'number', minimum: -2000, maximum: 2000, description: 'Angular velocity Roll (°/s)' },
        y: { type: 'number', minimum: -2000, maximum: 2000, description: 'Angular velocity Pitch (°/s)' },
        z: { type: 'number', minimum: -2000, maximum: 2000, description: 'Angular velocity Yaw (°/s)' },
      },
    },
    heartRate: { type: 'number', minimum: 30, maximum: 240, description: 'Optical PPG or ECG heart rate (BPM)' },
    muscleActivity: { type: 'number', minimum: 0, maximum: 200, description: 'Surface EMG envelope (% MVC)' },
    jointAngle: { type: 'number', minimum: -180, maximum: 180, description: 'Joint / spinal trunk flexion angle (degrees)' },
    pressure: { type: 'number', minimum: 0, maximum: 300, description: 'Piezoelectric / load cell force (kg equivalent)' },
    temperature: { type: 'number', minimum: 15, maximum: 50, description: 'Skin surface temperature (°C)' },
  },
};

export interface HardwareValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPayload: HardwareSensorPayload | null;
  flattenedReading: SensorReading | null;
}

/**
 * Validates an incoming HTTP request body against the official Hardware schema.
 * Supports both nested hardware schema and flat sensor reading format for flexibility.
 */
export function validateHardwarePayload(body: unknown): HardwareValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: ['Request body must be a valid non-empty JSON object.'],
      sanitizedPayload: null,
      flattenedReading: null,
    };
  }

  const raw = body as Record<string, any>;

  // Check if nested format or flat format
  const isNested = raw.accelerometer && typeof raw.accelerometer === 'object';

  let accX = 0;
  let accY = 0;
  let accZ = 9.81;
  let gyroX = 0;
  let gyroY = 0;
  let gyroZ = 0;
  let heartRate = 70;
  let muscleActivity = 5;
  let jointAngle = 0;
  let pressure = 0;
  let temperature = 36.5;
  let deviceId = typeof raw.deviceId === 'string' ? raw.deviceId : 'ESP32-BIO-DEFAULT';
  let sequenceNumber = typeof raw.sequenceNumber === 'number' ? raw.sequenceNumber : 0;
  let timestamp = typeof raw.timestamp === 'number' ? raw.timestamp : Date.now();

  if (isNested) {
    // Validate required fields
    const required = ['deviceId', 'timestamp', 'sequenceNumber', 'accelerometer', 'gyroscope', 'heartRate', 'muscleActivity', 'jointAngle', 'pressure', 'temperature'];
    for (const r of required) {
      if (raw[r] === undefined || raw[r] === null) {
        errors.push(`Missing required field: '${r}'.`);
      }
    }

    if (raw.accelerometer) {
      if (typeof raw.accelerometer.x !== 'number' || Number.isNaN(raw.accelerometer.x)) errors.push('accelerometer.x must be a number.');
      if (typeof raw.accelerometer.y !== 'number' || Number.isNaN(raw.accelerometer.y)) errors.push('accelerometer.y must be a number.');
      if (typeof raw.accelerometer.z !== 'number' || Number.isNaN(raw.accelerometer.z)) errors.push('accelerometer.z must be a number.');
      accX = Number(raw.accelerometer.x) || 0;
      accY = Number(raw.accelerometer.y) || 0;
      accZ = Number(raw.accelerometer.z) || 9.81;
    }

    if (raw.gyroscope) {
      if (typeof raw.gyroscope.x !== 'number' || Number.isNaN(raw.gyroscope.x)) errors.push('gyroscope.x must be a number.');
      if (typeof raw.gyroscope.y !== 'number' || Number.isNaN(raw.gyroscope.y)) errors.push('gyroscope.y must be a number.');
      if (typeof raw.gyroscope.z !== 'number' || Number.isNaN(raw.gyroscope.z)) errors.push('gyroscope.z must be a number.');
      gyroX = Number(raw.gyroscope.x) || 0;
      gyroY = Number(raw.gyroscope.y) || 0;
      gyroZ = Number(raw.gyroscope.z) || 0;
    }

    heartRate = Number(raw.heartRate);
    muscleActivity = Number(raw.muscleActivity);
    jointAngle = Number(raw.jointAngle);
    pressure = Number(raw.pressure);
    temperature = Number(raw.temperature);
  } else {
    // Flat format fallback
    accX = Number(raw.acc_x !== undefined ? raw.acc_x : raw.accX);
    accY = Number(raw.acc_y !== undefined ? raw.acc_y : raw.accY);
    accZ = Number(raw.acc_z !== undefined ? raw.acc_z : raw.accZ);
    gyroX = Number(raw.gyro_x !== undefined ? raw.gyro_x : raw.gyroX);
    gyroY = Number(raw.gyro_y !== undefined ? raw.gyro_y : raw.gyroY);
    gyroZ = Number(raw.gyro_z !== undefined ? raw.gyro_z : raw.gyroZ);
    heartRate = Number(raw.heart_rate !== undefined ? raw.heart_rate : raw.heartRate);
    muscleActivity = Number(raw.muscle_activity !== undefined ? raw.muscle_activity : raw.muscleActivity);
    jointAngle = Number(raw.joint_angle !== undefined ? raw.joint_angle : raw.jointAngle);
    pressure = Number(raw.pressure);
    temperature = Number(raw.temperature);
  }

  // Type & NaN checks
  if (Number.isNaN(heartRate)) errors.push('heartRate must be a valid number.');
  if (Number.isNaN(muscleActivity)) errors.push('muscleActivity must be a valid number.');
  if (Number.isNaN(jointAngle)) errors.push('jointAngle must be a valid number.');
  if (Number.isNaN(pressure)) errors.push('pressure must be a valid number.');
  if (Number.isNaN(temperature)) errors.push('temperature must be a valid number.');
  if (Number.isNaN(timestamp)) errors.push('timestamp must be a valid millisecond epoch number.');

  // Physiological boundary validation
  if (heartRate < SENSOR_BOUNDS.heart_rate.min || heartRate > SENSOR_BOUNDS.heart_rate.max) {
    errors.push(`heartRate ${heartRate} is out of physiological range [${SENSOR_BOUNDS.heart_rate.min}, ${SENSOR_BOUNDS.heart_rate.max} BPM].`);
  }
  if (jointAngle < SENSOR_BOUNDS.joint_angle.min || jointAngle > SENSOR_BOUNDS.joint_angle.max) {
    errors.push(`jointAngle ${jointAngle} is out of anatomical range [${SENSOR_BOUNDS.joint_angle.min}, ${SENSOR_BOUNDS.joint_angle.max}°].`);
  }
  if (muscleActivity < SENSOR_BOUNDS.muscle_activity.min || muscleActivity > SENSOR_BOUNDS.muscle_activity.max) {
    errors.push(`muscleActivity ${muscleActivity} is out of EMG bounds [${SENSOR_BOUNDS.muscle_activity.min}, ${SENSOR_BOUNDS.muscle_activity.max}% MVC].`);
  }
  if (pressure < SENSOR_BOUNDS.pressure.min || pressure > SENSOR_BOUNDS.pressure.max) {
    errors.push(`pressure ${pressure} is out of physical load bounds [${SENSOR_BOUNDS.pressure.min}, ${SENSOR_BOUNDS.pressure.max} kg].`);
  }
  if (temperature < SENSOR_BOUNDS.temperature.min || temperature > SENSOR_BOUNDS.temperature.max) {
    errors.push(`temperature ${temperature} is out of surface skin temp bounds [${SENSOR_BOUNDS.temperature.min}, ${SENSOR_BOUNDS.temperature.max}°C].`);
  }

  // Timestamp sanity check
  const now = Date.now();
  if (timestamp < 1577836800000) {
    errors.push('timestamp is invalid or predates system epoch (2020).');
  } else if (timestamp > now + 300000) {
    errors.push('timestamp is more than 5 minutes in the future.');
  }

  const isValid = errors.length === 0;

  let sanitizedPayload: HardwareSensorPayload | null = null;
  let flattenedReading: SensorReading | null = null;

  if (isValid) {
    sanitizedPayload = {
      deviceId,
      timestamp,
      sequenceNumber,
      accelerometer: { x: accX, y: accY, z: accZ },
      gyroscope: { x: gyroX, y: gyroY, z: gyroZ },
      heartRate,
      muscleActivity,
      jointAngle,
      pressure,
      temperature,
    };

    flattenedReading = {
      timestamp,
      acc_x: accX,
      acc_y: accY,
      acc_z: accZ,
      gyro_x: gyroX,
      gyro_y: gyroY,
      gyro_z: gyroZ,
      heart_rate: heartRate,
      muscle_activity: muscleActivity,
      joint_angle: jointAngle,
      pressure,
      temperature,
    };
  }

  return {
    isValid,
    errors,
    sanitizedPayload,
    flattenedReading,
  };
}

/**
 * Converts a flat SensorReading into the official nested HardwareSensorPayload contract.
 */
export function readingToHardwarePayload(reading: SensorReading, deviceId: string = 'ESP32-BIO-01', sequenceNumber: number = 0): HardwareSensorPayload {
  return {
    deviceId,
    timestamp: reading.timestamp,
    sequenceNumber,
    accelerometer: {
      x: reading.acc_x,
      y: reading.acc_y,
      z: reading.acc_z,
    },
    gyroscope: {
      x: reading.gyro_x,
      y: reading.gyro_y,
      z: reading.gyro_z,
    },
    heartRate: reading.heart_rate,
    muscleActivity: reading.muscle_activity,
    jointAngle: reading.joint_angle,
    pressure: reading.pressure,
    temperature: reading.temperature,
  };
}

/**
 * Converts a nested HardwareSensorPayload into a flat SensorReading.
 */
export function hardwarePayloadToReading(payload: HardwareSensorPayload): SensorReading {
  return {
    timestamp: payload.timestamp,
    acc_x: payload.accelerometer.x,
    acc_y: payload.accelerometer.y,
    acc_z: payload.accelerometer.z,
    gyro_x: payload.gyroscope.x,
    gyro_y: payload.gyroscope.y,
    gyro_z: payload.gyroscope.z,
    heart_rate: payload.heartRate,
    muscle_activity: payload.muscleActivity,
    joint_angle: payload.jointAngle,
    pressure: payload.pressure,
    temperature: payload.temperature,
  };
}
