import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { defaultAnalyticsEngine } from '../services/analyticsEngine';
import { apiClient } from '../services/apiClient';
import { DEMO_DEVICES } from '../services/demoData';
import { defaultSimulator, SimulatorState } from '../services/sensorSimulator';
import {
  ActivityType,
  Alert,
  Device,
  ProcessedMetrics,
  RiskLevel,
  SensorReading,
  Session,
} from '../types';
import { useAuth } from './AuthContext';

interface MonitoringContextType {
  // Real-time Telemetry
  latestReading: SensorReading;
  readingsBuffer: SensorReading[];
  latestMetrics: ProcessedMetrics;
  metricsHistory: ProcessedMetrics[];

  // Simulator Controls
  simulatorState: SimulatorState;
  currentActivity: ActivityType;
  sampleRateHz: number;
  startSimulator: () => void;
  pauseSimulator: () => void;
  stopSimulator: () => void;
  resetSimulator: () => void;
  setSimulatorActivity: (act: ActivityType) => void;
  setSampleRate: (hz: number) => void;

  // Active Session
  activeSession: Session | null;
  isSessionActive: boolean;
  startSession: (title?: string, activity?: ActivityType) => Promise<Session>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => Promise<Session | null>;

  // Alerts
  alerts: Alert[];
  unreadAlertsCount: number;
  markAlertRead: (id: string) => Promise<void>;
  clearAlerts: () => Promise<void>;

  // Hardware & Devices
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device) => void;
  refreshDevices: () => Promise<void>;

  // Sessions list
  sessions: Session[];
  refreshSessions: () => Promise<void>;

  // Reset Demo Data
  resetToDemo: () => void;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

const INITIAL_READING: SensorReading = {
  timestamp: Date.now(),
  acc_x: 0.05,
  acc_y: 0.12,
  acc_z: 9.81,
  gyro_x: 1.2,
  gyro_y: 0.8,
  gyro_z: 0.4,
  heart_rate: 72,
  muscle_activity: 12,
  joint_angle: 8,
  pressure: 3,
  temperature: 36.6,
};

const INITIAL_METRICS = defaultAnalyticsEngine.processReading(INITIAL_READING, 'light_work');

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Telemetry state
  const [latestReading, setLatestReading] = useState<SensorReading>(INITIAL_READING);
  const [readingsBuffer, setReadingsBuffer] = useState<SensorReading[]>([INITIAL_READING]);
  const [latestMetrics, setLatestMetrics] = useState<ProcessedMetrics>(INITIAL_METRICS);
  const [metricsHistory, setMetricsHistory] = useState<ProcessedMetrics[]>([INITIAL_METRICS]);

  // Simulator state
  const [simulatorState, setSimulatorState] = useState<SimulatorState>('running');
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('light_work');
  const [sampleRateHz, setSampleRateHzState] = useState<number>(5);

  // Active session
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const sessionReadingsRef = useRef<SensorReading[]>([]);
  const sessionMetricsRef = useRef<ProcessedMetrics[]>([]);
  const sessionStartTimeRef = useRef<number>(0);
  const sessionAlertsRef = useRef<string[]>([]);

  // Persistent lists
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [devices, setDevices] = useState<Device[]>(DEMO_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(DEMO_DEVICES[0]);

  // Cooldown timer to prevent alert flooding
  const lastAlertTimeRef = useRef<{ [key: string]: number }>({});

  // Initialize data
  useEffect(() => {
    refreshSessions();
    refreshAlerts();
    refreshDevices();
  }, []);

  const refreshSessions = async () => {
    const list = await apiClient.getSessions();
    setSessions(list);
  };

  const refreshAlerts = async () => {
    const list = await apiClient.getAlerts();
    setAlerts(list);
  };

  const refreshDevices = async () => {
    const list = await apiClient.getDevices();
    setDevices(list);
    if (list.length > 0 && !selectedDevice) {
      setSelectedDevice(list[0]);
    }
  };

  // Wire Simulator telemetry stream
  useEffect(() => {
    // Start simulator automatically on load so platform displays live data immediately
    defaultSimulator.start();
    setSimulatorState('running');

    const unsubscribe = defaultSimulator.subscribe(reading => {
      // Ingest into API
      apiClient.ingestSensorReading(reading);

      // Process via Analytics Engine
      const restingHR = user?.restingHeartRate || 65;
      const maxHR = user?.maxHeartRate || 185;
      const metrics = defaultAnalyticsEngine.processReading(reading, currentActivity, restingHR, maxHR);

      setLatestReading(reading);
      setLatestMetrics(metrics);

      // Keep recent sliding buffer (last 60 samples for real-time waveform)
      setReadingsBuffer(prev => {
        const next = [...prev, reading];
        if (next.length > 60) next.shift();
        return next;
      });

      // Keep metrics history (last 60 samples)
      setMetricsHistory(prev => {
        const next = [...prev, metrics];
        if (next.length > 60) next.shift();
        return next;
      });

      // Accumulate into active session if running
      if (activeSession && activeSession.status === 'active') {
        sessionReadingsRef.current.push(reading);
        sessionMetricsRef.current.push(metrics);
      }

      // Check alert conditions with 20s cooldown per category
      checkAndTriggerAlerts(metrics, reading);
    });

    return () => {
      unsubscribe();
      defaultSimulator.stop();
    };
  }, [currentActivity, user, activeSession]);

  const checkAndTriggerAlerts = (metrics: ProcessedMetrics, reading: SensorReading) => {
    const now = Date.now();
    const COOLDOWN_MS = 25000;

    const maybeAlert = (key: string, alertData: Omit<Alert, 'id' | 'timestamp' | 'isRead'>) => {
      const last = lastAlertTimeRef.current[key] || 0;
      if (now - last > COOLDOWN_MS) {
        lastAlertTimeRef.current[key] = now;
        const newAlert: Alert = {
          ...alertData,
          id: `alt_${now}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          isRead: false,
          sessionId: activeSession?.id,
        };
        apiClient.addAlert(newAlert).then(() => {
          setAlerts(prev => [newAlert, ...prev]);
          if (activeSession) {
            sessionAlertsRef.current.push(newAlert.id);
          }
        });
      }
    };

    // 1. Posture risk alert
    if (metrics.postureStatus === 'high_risk' && Math.abs(reading.joint_angle) > 48) {
      maybeAlert('posture_high', {
        severity: 'critical',
        category: 'Posture',
        title: 'Severe Joint Angle Exceeded',
        description: `Joint angle measured at ${reading.joint_angle}° (>45° threshold), increasing shear force on lumbar spine.`,
        recommendedAction: 'Reposition workstation or adjust lifting plane to restore neutral spine.',
      });
    }

    // 2. Fatigue risk alert
    if (metrics.fatigueScore >= 75) {
      maybeAlert('fatigue_high', {
        severity: 'critical',
        category: 'Fatigue',
        title: 'High Fatigue Threshold Reached',
        description: `Estimated fatigue reached ${metrics.fatigueScore}/100 with continuous muscle recruitment.`,
        recommendedAction: 'Mandatory 10-minute task rotation or active physiological recovery interval.',
      });
    } else if (metrics.fatigueScore >= 60) {
      maybeAlert('fatigue_mod', {
        severity: 'warning',
        category: 'Fatigue',
        title: 'Elevated Fatigue Indicator',
        description: `Fatigue level elevated to ${metrics.fatigueScore}/100. Pacing attention required.`,
        recommendedAction: 'Monitor movement smoothness; prepare for shift break.',
      });
    }

    // 3. Physical load alert
    if (reading.pressure > (user?.maxLoadPermissibleKg || 25)) {
      maybeAlert('load_max', {
        severity: 'warning',
        category: 'Physical Load',
        title: 'Permissible Load Threshold Exceeded',
        description: `Measured load pressure of ${reading.pressure} kg exceeds safe ergonomic ceiling (${user?.maxLoadPermissibleKg || 25} kg).`,
        recommendedAction: 'Engage mechanical hoist or multi-operator lift procedure.',
      });
    }

    // 4. Abnormal movement jerk
    const mag = defaultAnalyticsEngine.calculateAccelerationMagnitude(reading);
    if (mag > 22) {
      maybeAlert('kinematic_jerk', {
        severity: 'warning',
        category: 'Movement',
        title: 'Sudden Kinematic Jerk / Slip Indicator',
        description: `High acceleration impact (${mag.toFixed(1)} m/s²) recorded on primary IMU axes.`,
        recommendedAction: 'Check operator balance and floor slip resistance.',
      });
    }
  };

  // Simulator Actions
  const startSimulator = () => {
    defaultSimulator.start();
    setSimulatorState('running');
  };

  const pauseSimulator = () => {
    defaultSimulator.pause();
    setSimulatorState('paused');
  };

  const stopSimulator = () => {
    defaultSimulator.stop();
    setSimulatorState('stopped');
  };

  const resetSimulator = () => {
    defaultSimulator.reset();
    defaultAnalyticsEngine.reset();
    setSimulatorState('stopped');
  };

  const setSimulatorActivity = (act: ActivityType) => {
    setCurrentActivity(act);
    defaultSimulator.setActivityType(act);
  };

  const setSampleRate = (hz: number) => {
    setSampleRateHzState(hz);
    defaultSimulator.setSampleRate(hz);
  };

  // Active Session Lifecycle
  const startSession = async (title?: string, activity: ActivityType = currentActivity): Promise<Session> => {
    const startTime = Date.now();
    sessionStartTimeRef.current = startTime;
    sessionReadingsRef.current = [];
    sessionMetricsRef.current = [];
    sessionAlertsRef.current = [];

    const newSession: Session = {
      id: `ses_${startTime}`,
      userId: user?.uid || 'usr_demo_8821',
      deviceId: selectedDevice?.deviceId || 'DEV-HA-ESP32-01',
      deviceName: selectedDevice?.deviceName || 'Demo Wearable v2.1',
      startTime,
      durationSeconds: 0,
      status: 'active',
      activityType: activity,
      title: title || `Telemetry Session · ${activity.replace('_', ' ').toUpperCase()}`,
      summary: {
        avgHeartRate: latestReading.heart_rate,
        peakHeartRate: latestReading.heart_rate,
        avgMuscleActivity: latestReading.muscle_activity,
        peakMuscleActivity: latestReading.muscle_activity,
        avgFatigueScore: latestMetrics.fatigueScore,
        peakFatigueScore: latestMetrics.fatigueScore,
        avgPostureScore: latestMetrics.postureRiskScore,
        timeInHighRiskPostureSeconds: 0,
        movementScore: latestMetrics.movementScore,
        totalRepetitions: 0,
        abnormalMovementCount: 0,
        overallRisk: latestMetrics.overallRisk,
        alertsCount: 0,
      },
      readingsCount: 0,
      alertsGenerated: [],
    };

    setActiveSession(newSession);
    setSimulatorActivity(activity);
    startSimulator();
    return newSession;
  };

  const pauseSession = () => {
    if (!activeSession) return;
    setActiveSession(prev => (prev ? { ...prev, status: 'paused' } : null));
    pauseSimulator();
  };

  const resumeSession = () => {
    if (!activeSession) return;
    setActiveSession(prev => (prev ? { ...prev, status: 'active' } : null));
    startSimulator();
  };

  const endSession = async (): Promise<Session | null> => {
    if (!activeSession) return null;
    const endTime = Date.now();
    const durationSeconds = Math.max(1, Math.round((endTime - sessionStartTimeRef.current) / 1000));

    const readings = sessionReadingsRef.current;
    const metrics = sessionMetricsRef.current;

    // Calculate aggregated session summary
    const hrValues = readings.map(r => r.heart_rate);
    const muscleValues = readings.map(r => r.muscle_activity);
    const fatigueValues = metrics.map(m => m.fatigueScore);
    const postureValues = metrics.map(m => m.postureRiskScore);

    const avgHR = hrValues.length ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : 75;
    const peakHR = hrValues.length ? Math.max(...hrValues) : 85;
    const avgMuscle = muscleValues.length ? Number((muscleValues.reduce((a, b) => a + b, 0) / muscleValues.length).toFixed(1)) : 20;
    const peakMuscle = muscleValues.length ? Number(Math.max(...muscleValues).toFixed(1)) : 40;
    const avgFatigue = fatigueValues.length ? Math.round(fatigueValues.reduce((a, b) => a + b, 0) / fatigueValues.length) : 25;
    const peakFatigue = fatigueValues.length ? Math.max(...fatigueValues) : 35;
    const avgPosture = postureValues.length ? Math.round(postureValues.reduce((a, b) => a + b, 0) / postureValues.length) : 20;

    const highRiskReadingsCount = readings.filter(r => Math.abs(r.joint_angle) > 45).length;
    const sampleDt = 1 / sampleRateHz;
    const highRiskDuration = Math.round(highRiskReadingsCount * sampleDt);

    let finalRisk: RiskLevel = 'low';
    if (avgFatigue > 65 || avgPosture > 60 || peakFatigue > 80) finalRisk = 'high';
    else if (avgFatigue > 45 || avgPosture > 35) finalRisk = 'moderate';

    const completedSession: Session = {
      ...activeSession,
      status: 'completed',
      endTime,
      durationSeconds,
      summary: {
        avgHeartRate: avgHR,
        peakHeartRate: peakHR,
        avgMuscleActivity: avgMuscle,
        peakMuscleActivity: peakMuscle,
        avgFatigueScore: avgFatigue,
        peakFatigueScore: peakFatigue,
        avgPostureScore: avgPosture,
        timeInHighRiskPostureSeconds: highRiskDuration,
        movementScore: metrics.length ? metrics[metrics.length - 1].movementScore : 85,
        totalRepetitions: metrics.length ? metrics[metrics.length - 1].repetitionCount : 0,
        abnormalMovementCount: metrics.length ? metrics[metrics.length - 1].abnormalMovementEvents : 0,
        overallRisk: finalRisk,
        alertsCount: sessionAlertsRef.current.length,
      },
      readingsCount: readings.length,
      alertsGenerated: sessionAlertsRef.current,
    };

    await apiClient.saveSession(completedSession);
    setActiveSession(null);
    await refreshSessions();
    return completedSession;
  };

  // Alerts Management
  const markAlertRead = async (id: string) => {
    await apiClient.markAlertAsRead(id);
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const clearAlerts = async () => {
    await apiClient.clearAllAlerts();
    setAlerts([]);
  };

  // Reset to Demo Data
  const resetToDemo = () => {
    apiClient.resetDemoData();
    refreshSessions();
    refreshAlerts();
    refreshDevices();
    setSimulatorActivity('light_work');
    defaultSimulator.reset();
    defaultSimulator.start();
    setSimulatorState('running');
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <MonitoringContext.Provider
      value={{
        latestReading,
        readingsBuffer,
        latestMetrics,
        metricsHistory,
        simulatorState,
        currentActivity,
        sampleRateHz,
        startSimulator,
        pauseSimulator,
        stopSimulator,
        resetSimulator,
        setSimulatorActivity,
        setSampleRate,
        activeSession,
        isSessionActive: !!activeSession,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        alerts,
        unreadAlertsCount,
        markAlertRead,
        clearAlerts,
        devices,
        selectedDevice,
        setSelectedDevice,
        refreshDevices,
        sessions,
        refreshSessions,
        resetToDemo,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
