import { ActivityType, SensorReading } from '../types';

export type SimulatorState = 'running' | 'paused' | 'stopped';

export interface SimulatorConfig {
  sampleRateHz: number; // e.g. 5Hz or 10Hz
  activityType: ActivityType;
}

/**
 * Biomechanical & Ergonomic Correlated Sensor Simulator
 *
 * Implements realistic physiological state machines rather than independent random noise:
 * - Cardiac inertia (heart rate ramps with exponential physiological lag)
 * - Cyclic kinematics (repetitive lifting and gait cycles)
 * - Load-correlated electromyography (muscle recruitment scales with external pressure)
 * - Active thermal drift under sustained exertion
 */
export class SensorSimulator {
  private state: SimulatorState = 'stopped';
  private config: SimulatorConfig = {
    sampleRateHz: 5,
    activityType: 'light_work',
  };

  private timerId: number | null = null;
  private listeners: ((reading: SensorReading) => void)[] = [];

  // Internal physiological state variables (continuity between samples)
  private elapsedSeconds: number = 0;
  private currentHR: number = 72;
  private targetHR: number = 95;
  private currentTemp: number = 36.6;
  private currentMuscle: number = 18;
  private currentAngle: number = 12;
  private currentLoad: number = 8;
  private stepPhase: number = 0; // for sinusoidal gait & lifting cycle

  constructor(initialConfig?: Partial<SimulatorConfig>) {
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }
    this.updateTargetsForActivity(this.config.activityType);
  }

  public getState(): SimulatorState {
    return this.state;
  }

  public getConfig(): SimulatorConfig {
    return { ...this.config };
  }

  public setActivityType(activity: ActivityType): void {
    this.config.activityType = activity;
    this.updateTargetsForActivity(activity);
  }

  public setSampleRate(hz: number): void {
    const clamped = Math.max(1, Math.min(50, hz));
    this.config.sampleRateHz = clamped;
    if (this.state === 'running') {
      this.stopTimer();
      this.startTimer();
    }
  }

  public subscribe(listener: (reading: SensorReading) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public start(): void {
    if (this.state === 'running') return;
    this.state = 'running';
    this.startTimer();
  }

  public pause(): void {
    if (this.state !== 'running') return;
    this.state = 'paused';
    this.stopTimer();
  }

  public stop(): void {
    this.state = 'stopped';
    this.stopTimer();
  }

  public reset(): void {
    this.stop();
    this.elapsedSeconds = 0;
    this.currentHR = 72;
    this.currentTemp = 36.6;
    this.currentMuscle = 12;
    this.currentAngle = 8;
    this.currentLoad = 4;
    this.stepPhase = 0;
    this.updateTargetsForActivity(this.config.activityType);
  }

  private startTimer(): void {
    const intervalMs = Math.round(1000 / this.config.sampleRateHz);
    this.timerId = window.setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private updateTargetsForActivity(activity: ActivityType): void {
    switch (activity) {
      case 'rest':
        this.targetHR = 66;
        break;
      case 'recovery':
        this.targetHR = 70;
        break;
      case 'walking':
        this.targetHR = 102;
        break;
      case 'light_work':
        this.targetHR = 96;
        break;
      case 'repetitive_work':
        this.targetHR = 118;
        break;
      case 'heavy_work':
        this.targetHR = 148;
        break;
    }
  }

  /**
   * Generates the next correlated bio-mechanical telemetry sample
   */
  private tick(): void {
    const dt = 1 / this.config.sampleRateHz;
    this.elapsedSeconds += dt;
    this.stepPhase += dt * 2 * Math.PI; // angular velocity for periodic components

    const act = this.config.activityType;

    // 1. Cardiovascular lag: HR smoothly drifts towards target (cardiac inertia)
    const hrInertiaRate = act === 'recovery' ? 0.08 : 0.05;
    this.currentHR += (this.targetHR - this.currentHR) * hrInertiaRate * dt * 4;
    const hrNoise = (Math.random() - 0.5) * 1.5;
    const reportedHR = Math.round(this.currentHR + hrNoise);

    // 2. Kinematic & Biomechanical models by Activity
    let accX = 0;
    let accY = 0;
    let accZ = 9.81;
    let gyroX = 0;
    let gyroY = 0;
    let gyroZ = 0;
    let muscleTarget = 10;
    let angleTarget = 10;
    let loadTarget = 2;
    let tempTarget = 36.6;

    if (act === 'rest') {
      // Resting baseline: subject seated/standing neutral, micro-tremor only
      accX = (Math.random() - 0.5) * 0.15;
      accY = (Math.random() - 0.5) * 0.15;
      accZ = 9.81 + (Math.random() - 0.5) * 0.1;
      gyroX = (Math.random() - 0.5) * 0.8;
      gyroY = (Math.random() - 0.5) * 0.8;
      gyroZ = (Math.random() - 0.5) * 0.8;
      muscleTarget = 6 + Math.sin(this.stepPhase * 0.2) * 1.5;
      angleTarget = 5 + Math.sin(this.stepPhase * 0.1) * 2;
      loadTarget = 0.5;
      tempTarget = 36.5;
    } else if (act === 'recovery') {
      // Active recovery: relaxed deep breathing, settling vitals
      accX = (Math.random() - 0.5) * 0.25;
      accY = (Math.random() - 0.5) * 0.2;
      accZ = 9.81 + Math.sin(this.stepPhase * 0.3) * 0.2; // thoracic chest expansion
      gyroX = (Math.random() - 0.5) * 1.2;
      gyroY = (Math.random() - 0.5) * 1.2;
      gyroZ = (Math.random() - 0.5) * 1.0;
      muscleTarget = 8 + (Math.random() - 0.5) * 2;
      angleTarget = 6;
      loadTarget = 1.0;
      tempTarget = 36.6;
    } else if (act === 'walking') {
      // Bipedal gait: 1.8 Hz fundamental frequency, rhythmic Z impact and X sway
      const gaitFreq = 1.8;
      const omega = this.elapsedSeconds * 2 * Math.PI * gaitFreq;
      accX = Math.sin(omega * 0.5) * 1.2 + (Math.random() - 0.5) * 0.3; // lateral sway
      accY = Math.cos(omega) * 1.8 + (Math.random() - 0.5) * 0.4; // forward thrust
      accZ = 9.81 + Math.sin(omega) * 3.4 + (Math.random() - 0.5) * 0.6; // heel strike impact
      gyroX = Math.cos(omega) * 38;
      gyroY = Math.sin(omega * 0.5) * 24;
      gyroZ = Math.sin(omega) * 18;
      muscleTarget = 32 + Math.abs(Math.sin(omega)) * 25;
      angleTarget = 14 + Math.sin(omega) * 8;
      loadTarget = 4 + (Math.random() - 0.5) * 1;
      tempTarget = 36.8;
    } else if (act === 'light_work') {
      // Light industrial handling: precision assembly, tool manipulation
      const t = this.elapsedSeconds;
      accX = Math.sin(t * 1.5) * 1.1 + (Math.random() - 0.5) * 0.5;
      accY = Math.cos(t * 2.1) * 1.4 + (Math.random() - 0.5) * 0.6;
      accZ = 9.81 + Math.sin(t * 1.1) * 1.6 + (Math.random() - 0.5) * 0.4;
      gyroX = Math.sin(t * 2) * 25;
      gyroY = Math.cos(t * 1.5) * 28;
      gyroZ = Math.sin(t * 0.8) * 15;
      muscleTarget = 28 + Math.abs(Math.sin(t * 1.3)) * 22;
      angleTarget = 22 + Math.sin(t * 0.7) * 12; // reaching, moderate bend
      loadTarget = 8 + Math.abs(Math.sin(t * 0.5)) * 6;
      tempTarget = 36.9;
    } else if (act === 'repetitive_work') {
      // Industrial repetitive cyclic motion: 3.5s cycle time with consistent trunk flexion
      const cycleFreq = 1 / 3.5;
      const cycleTheta = (this.elapsedSeconds * cycleFreq * 2 * Math.PI) % (2 * Math.PI);
      const isLiftingPhase = cycleTheta > Math.PI * 0.8 && cycleTheta < Math.PI * 1.6;

      accX = Math.sin(cycleTheta) * 2.0;
      accY = Math.cos(cycleTheta) * 2.4;
      accZ = 9.81 + (isLiftingPhase ? 4.2 : -1.8) + (Math.random() - 0.5) * 0.8;
      gyroX = Math.sin(cycleTheta) * 65;
      gyroY = Math.cos(cycleTheta) * 45;
      gyroZ = (Math.random() - 0.5) * 20;

      muscleTarget = isLiftingPhase ? 68 + (Math.random() - 0.5) * 12 : 24;
      // High trunk bend at pickup point (up to 48 degrees)
      angleTarget = 15 + Math.sin(cycleTheta) * 32;
      loadTarget = isLiftingPhase ? 18.5 : 3.0;
      tempTarget = 37.1;
    } else if (act === 'heavy_work') {
      // Heavy pallet lifting and continuous material transport
      const cycleFreq = 1 / 5.0; // 5-second heavy lift/carry cycle
      const cycleTheta = (this.elapsedSeconds * cycleFreq * 2 * Math.PI) % (2 * Math.PI);
      const isPeakEffort = cycleTheta > 1.2 && cycleTheta < 3.4;

      accX = Math.sin(cycleTheta) * 3.2 + (Math.random() - 0.5) * 1.2;
      accY = Math.cos(cycleTheta) * 3.8 + (Math.random() - 0.5) * 1.0;
      accZ = 9.81 + (isPeakEffort ? 5.8 : -2.2) + (Math.random() - 0.5) * 1.4;
      gyroX = Math.sin(cycleTheta * 1.2) * 85;
      gyroY = Math.cos(cycleTheta * 0.9) * 70;
      gyroZ = Math.sin(cycleTheta) * 45;

      muscleTarget = isPeakEffort ? 82 + (Math.random() - 0.5) * 14 : 45;
      // Hazardous trunk bend (45 - 65 degrees)
      angleTarget = 24 + Math.abs(Math.sin(cycleTheta)) * 38;
      loadTarget = isPeakEffort ? 28.5 + (Math.random() - 0.5) * 3 : 12;
      tempTarget = 37.4;
    }

    // Smooth physical parameters
    this.currentMuscle += (muscleTarget - this.currentMuscle) * 0.3;
    this.currentAngle += (angleTarget - this.currentAngle) * 0.25;
    this.currentLoad += (loadTarget - this.currentLoad) * 0.2;
    this.currentTemp += (tempTarget - this.currentTemp) * 0.02;

    const reading: SensorReading = {
      timestamp: Date.now(),
      acc_x: Number(accX.toFixed(3)),
      acc_y: Number(accY.toFixed(3)),
      acc_z: Number(accZ.toFixed(3)),
      gyro_x: Number(gyroX.toFixed(2)),
      gyro_y: Number(gyroY.toFixed(2)),
      gyro_z: Number(gyroZ.toFixed(2)),
      heart_rate: reportedHR,
      muscle_activity: Math.min(100, Math.max(0, Number(this.currentMuscle.toFixed(1)))),
      joint_angle: Math.max(0, Number(this.currentAngle.toFixed(1))),
      pressure: Math.max(0, Number(this.currentLoad.toFixed(1))),
      temperature: Number(this.currentTemp.toFixed(1)),
    };

    // Broadcast to subscribers
    for (const listener of this.listeners) {
      listener(reading);
    }
  }
}

export const defaultSimulator = new SensorSimulator();
