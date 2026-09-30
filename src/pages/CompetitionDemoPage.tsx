import {
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  FileCheck,
  Flame,
  Heart,
  Info,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Volume2,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { BiomechanicalWireframe } from '../components/common/BiomechanicalWireframe';
import { RiskBadge, RiskIndicator } from '../components/common/RiskBadge';
import { WaveformChart } from '../components/common/WaveformChart';
import { defaultAnalyticsEngine } from '../services/analyticsEngine';
import { ActivityType, Alert, ProcessedMetrics, RiskLevel, SensorReading, Session } from '../types';

export const CompetitionDemoPage: React.FC = () => {
  // Step State: 1 to 10
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('heavy_work');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [sampleHz, setSampleHz] = useState<number>(5);

  // Active Live Data Pipeline (State variables feeding actual analytics engine)
  const [liveReading, setLiveReading] = useState<SensorReading>({
    timestamp: Date.now(),
    acc_x: 0.05,
    acc_y: 0.1,
    acc_z: 9.81,
    gyro_x: 0.8,
    gyro_y: 0.4,
    gyro_z: 0.2,
    heart_rate: 68,
    muscle_activity: 12,
    joint_angle: 8,
    pressure: 2,
    temperature: 36.6,
  });

  const [readingsHistory, setReadingsHistory] = useState<SensorReading[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<ProcessedMetrics>(() =>
    defaultAnalyticsEngine.processReading(
      {
        timestamp: Date.now(),
        acc_x: 0.05,
        acc_y: 0.1,
        acc_z: 9.81,
        gyro_x: 0.8,
        gyro_y: 0.4,
        gyro_z: 0.2,
        heart_rate: 68,
        muscle_activity: 12,
        joint_angle: 8,
        pressure: 2,
        temperature: 36.6,
      },
      'heavy_work'
    )
  );

  // Demo Alerts (isolated from persistent user storage to protect real records)
  const [demoAlerts, setDemoAlerts] = useState<Alert[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Step 10 Final Summary State
  const [completedDemoSession, setCompletedDemoSession] = useState<Session | null>(null);

  // Internal loop refs
  const elapsedTicksRef = useRef<number>(0);
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  // Step definition details for Judges
  const stepsMeta = [
    {
      step: 1,
      title: 'Wearable Unit Status',
      tag: 'HARDWARE CONTRACT',
      desc: 'Verify device identifier & state designated as SIMULATED pod.',
    },
    {
      step: 2,
      title: 'Select Ergonomic Activity',
      tag: 'BIOMECHANICS',
      desc: 'Choose industrial protocol (Rest, Walking, Light/Heavy/Repetitive Work, Recovery).',
    },
    {
      step: 3,
      title: 'Start Live Telemetry Session',
      tag: 'STREAM INITIATION',
      desc: 'Activate continuous telemetry collection through ingestion pipeline.',
    },
    {
      step: 4,
      title: 'Real-time Signal Ingestion',
      tag: '10-AXIS PIPELINE',
      desc: 'Generate deterministic bio-signals with cardiac inertia and cyclic kinematics.',
    },
    {
      step: 5,
      title: 'Live Waveform Charts',
      tag: 'OSCILLOSCOPE',
      desc: 'Monitor multi-channel physiological and kinematic signals.',
    },
    {
      step: 6,
      title: 'Gradual Exertion Ramp',
      tag: 'PHYSIOLOGICAL LOAD',
      desc: 'Watch gradual cardiac, EMG, flexion angle, and fatigue score accumulation.',
    },
    {
      step: 7,
      title: 'Threshold Alert Triggering',
      tag: 'SAFETY BOUNDARIES',
      desc: 'Observe automatic incident triggers for posture violation & fatigue limits.',
    },
    {
      step: 8,
      title: 'Dynamic Risk Synthesizer',
      tag: 'REBA / ISO 11226',
      desc: 'Real-time risk tier transition (Low → Moderate → High Tier).',
    },
    {
      step: 9,
      title: 'Conclude Telemetry Session',
      tag: 'AUDIT SEALING',
      desc: 'Halt data acquisition and invoke session aggregation analytics.',
    },
    {
      step: 10,
      title: 'Comprehensive Audit Summary',
      tag: 'EXPLAINABLE DECISION',
      desc: 'Inspect metrics, ergonomic scorecards, incident counts, and action plans.',
    },
  ];

  // Activities configuration
  const activities: { id: ActivityType; name: string; tag: string; description: string }[] = [
    {
      id: 'heavy_work',
      name: 'Heavy Work (Recommended)',
      tag: 'Pallet Transfer',
      description: 'Progressive lift weights (28kg), spine flexion (>45°), and rapid cardiovascular exertion.',
    },
    {
      id: 'repetitive_work',
      name: 'Repetitive Work',
      tag: 'Cyclic Picking',
      description: 'Continuous flexion cycles testing repetition counting & localized muscular fatigue.',
    },
    {
      id: 'light_work',
      name: 'Light Work',
      tag: 'Assembly Station',
      description: 'Steady metabolic cadence, controlled biomechanics, and sustainable pacing.',
    },
    {
      id: 'walking',
      name: 'Walking',
      tag: 'Bipedal Gait',
      description: 'Dynamic 3-axis acceleration and periodic step phase frequency.',
    },
    {
      id: 'recovery',
      name: 'Active Recovery',
      tag: 'Respiration Pacing',
      description: 'Heart rate declination and active fatigue recovery credits.',
    },
    {
      id: 'rest',
      name: 'Baseline Rest',
      tag: 'Homeostasis',
      description: 'Nominal physiological resting baseline with zero external pressure load.',
    },
  ];

  // Timer loop for simulation
  useEffect(() => {
    if (!isMonitoring) return;

    const intervalMs = Math.round(1000 / sampleHz);
    const timer = setInterval(() => {
      elapsedTicksRef.current += 1;
      const ticks = elapsedTicksRef.current;
      const tSeconds = ticks / sampleHz;
      setSessionSeconds(Math.floor(tSeconds));

      // Calculate progressive exertion ramp based on step 6
      // Simulate cardiac inertia and gradual musculoskeletal ramp
      const phase = (ticks % 40) / 40 * Math.PI * 2;
      const rampProgress = Math.min(1, tSeconds / 25); // Exertion ramps up over 25 seconds

      let baseHR = 72;
      let targetHR = 142;
      let baseMuscle = 15;
      let targetMuscle = 78;
      let baseAngle = 10;
      let targetAngle = 54;
      let basePressure = 4;
      let targetPressure = 28;

      if (selectedActivity === 'light_work') {
        targetHR = 92;
        targetMuscle = 30;
        targetAngle = 22;
        targetPressure = 6;
      } else if (selectedActivity === 'walking') {
        targetHR = 102;
        targetMuscle = 35;
        targetAngle = 16;
        targetPressure = 2;
      } else if (selectedActivity === 'repetitive_work') {
        targetHR = 118;
        targetMuscle = 58;
        targetAngle = Math.sin(phase) > 0 ? 46 : 14;
        targetPressure = 15;
      } else if (selectedActivity === 'recovery' || selectedActivity === 'rest') {
        targetHR = 65;
        targetMuscle = 8;
        targetAngle = 4;
        targetPressure = 0;
      }

      // Interpolate with physiological noise
      const currentHR = Math.round(
        baseHR + (targetHR - baseHR) * rampProgress + Math.sin(phase) * 3
      );
      const currentMuscle = Number(
        (baseMuscle + (targetMuscle - baseMuscle) * rampProgress + Math.sin(phase * 2) * 5).toFixed(1)
      );
      const currentAngle = Number(
        (
          selectedActivity === 'repetitive_work'
            ? targetAngle + Math.sin(phase) * 4
            : baseAngle + (targetAngle - baseAngle) * rampProgress + Math.sin(phase) * 6
        ).toFixed(1)
      );
      const currentPressure = Number(
        (basePressure + (targetPressure - basePressure) * rampProgress).toFixed(1)
      );

      // Accelerometer and Gyroscope dynamic profiles
      const accX = Number((Math.sin(phase) * (0.2 + rampProgress * 1.5)).toFixed(3));
      const accY = Number((Math.cos(phase) * (0.3 + rampProgress * 2.0)).toFixed(3));
      const accZ = Number((9.81 + Math.sin(phase * 2) * (0.5 + rampProgress * 3.2)).toFixed(3));

      const gyroX = Number((Math.sin(phase) * (5 + rampProgress * 35)).toFixed(1));
      const gyroY = Number((Math.cos(phase) * (8 + rampProgress * 45)).toFixed(1));
      const gyroZ = Number((Math.sin(phase * 2) * (3 + rampProgress * 25)).toFixed(1));

      const newReading: SensorReading = {
        timestamp: Date.now(),
        acc_x: accX,
        acc_y: accY,
        acc_z: accZ,
        gyro_x: gyroX,
        gyro_y: gyroY,
        gyro_z: gyroZ,
        heart_rate: Math.max(50, currentHR),
        muscle_activity: Math.max(0, currentMuscle),
        joint_angle: currentAngle,
        pressure: Math.max(0, currentPressure),
        temperature: Number((36.6 + rampProgress * 0.8).toFixed(1)),
      };

      // PASS DIRECTLY INTO REAL ANALYTICS ENGINE PIPELINE
      const metrics = defaultAnalyticsEngine.processReading(
        newReading,
        selectedActivity,
        65,
        185
      );

      setLiveReading(newReading);
      setLiveMetrics(metrics);

      setReadingsHistory(prev => {
        const next = [...prev, newReading];
        if (next.length > 50) next.shift();
        return next;
      });

      // TRIGGER REALISTIC ALERTS AS THRESHOLDS ARE CROSSED (Step 7)
      if (metrics.postureStatus === 'high_risk' && !triggeredAlertsRef.current.has('alert_posture')) {
        triggeredAlertsRef.current.add('alert_posture');
        const alert: Alert = {
          id: `demo_alt_${Date.now()}_1`,
          timestamp: Date.now(),
          severity: 'critical',
          category: 'Posture',
          title: 'High-Risk Trunk Flexion Detected (>45°)',
          description: `Spine bending measured at ${newReading.joint_angle.toFixed(1)}°, exceeding ISO 11226 and REBA ergonomic safety criteria.`,
          recommendedAction: 'Adjust staging height or engage pallet hydraulic lift.',
          isRead: false,
        };
        setDemoAlerts(prev => [alert, ...prev]);
        if (currentStep < 7) setCurrentStep(7);
      }

      if (metrics.fatigueScore >= 45 && !triggeredAlertsRef.current.has('alert_fatigue')) {
        triggeredAlertsRef.current.add('alert_fatigue');
        const alert: Alert = {
          id: `demo_alt_${Date.now()}_2`,
          timestamp: Date.now(),
          severity: 'warning',
          category: 'Fatigue',
          title: 'Cumulative Fatigue Index Elevated',
          description: `Cardiovascular and muscular load combination escalated fatigue index to ${metrics.fatigueScore}/100.`,
          recommendedAction: 'Initiate mandatory task rotation or 5-minute ergonomic break.',
          isRead: false,
        };
        setDemoAlerts(prev => [alert, ...prev]);
        if (currentStep < 8) setCurrentStep(8);
      }

      // Automatically sync active step based on progress
      if (currentStep === 4 && tSeconds > 3) setCurrentStep(5);
      if (currentStep === 5 && tSeconds > 8) setCurrentStep(6);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isMonitoring, selectedActivity, sampleHz, currentStep]);

  // Actions
  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    setSessionStartTime(Date.now());
    elapsedTicksRef.current = 0;
    triggeredAlertsRef.current.clear();
    setDemoAlerts([]);
    setCurrentStep(4);
  };

  const handleEndSession = () => {
    setIsMonitoring(false);
    setCurrentStep(10);

    // Build the finalized session summary directly from the pipeline state
    const hrHistory = readingsHistory.map(r => r.heart_rate);
    const muscleHistory = readingsHistory.map(r => r.muscle_activity);
    const avgHR = hrHistory.length
      ? Math.round(hrHistory.reduce((a, b) => a + b, 0) / hrHistory.length)
      : liveReading.heart_rate;
    const peakHR = hrHistory.length ? Math.max(...hrHistory) : liveReading.heart_rate;
    const avgMuscle = muscleHistory.length
      ? Number((muscleHistory.reduce((a, b) => a + b, 0) / muscleHistory.length).toFixed(1))
      : liveReading.muscle_activity;
    const peakMuscle = muscleHistory.length ? Math.max(...muscleHistory) : liveReading.muscle_activity;

    const highRiskDuration = readingsHistory.filter(r => Math.abs(r.joint_angle) > 45).length * (1 / sampleHz);

    const sessionSummary: Session = {
      id: `demo_ses_${Date.now()}`,
      userId: 'usr_demo_competition',
      deviceId: 'ESP32-BIO-SIMULATED-01',
      deviceName: 'ESP32 Biomechanical Rig (Simulated Pod)',
      startTime: sessionStartTime || Date.now() - sessionSeconds * 1000,
      endTime: Date.now(),
      durationSeconds: Math.max(1, sessionSeconds),
      status: 'completed',
      activityType: selectedActivity,
      title: `Competition Trial · ${selectedActivity.replace('_', ' ').toUpperCase()}`,
      summary: {
        avgHeartRate: avgHR,
        peakHeartRate: peakHR,
        avgMuscleActivity: avgMuscle,
        peakMuscleActivity: peakMuscle,
        avgFatigueScore: liveMetrics.fatigueScore,
        peakFatigueScore: Math.min(100, liveMetrics.fatigueScore + 8),
        avgPostureScore: liveMetrics.postureRiskScore,
        timeInHighRiskPostureSeconds: Math.round(highRiskDuration),
        movementScore: liveMetrics.movementScore,
        totalRepetitions: liveMetrics.repetitionCount,
        abnormalMovementCount: liveMetrics.abnormalMovementEvents,
        overallRisk: liveMetrics.overallRisk,
        alertsCount: demoAlerts.length,
      },
      readingsCount: readingsHistory.length,
      alertsGenerated: demoAlerts.map(a => a.id),
      notes: 'Controlled evaluation trial executed in Competition Demo Mode without physical hardware tethering.',
    };

    setCompletedDemoSession(sessionSummary);
  };

  const handleResetDemo = () => {
    setIsMonitoring(false);
    setCurrentStep(1);
    setSessionSeconds(0);
    elapsedTicksRef.current = 0;
    triggeredAlertsRef.current.clear();
    setDemoAlerts([]);
    setReadingsHistory([]);
    setCompletedDemoSession(null);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Prominent Global Competition Demo Mode Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-950/90 via-[#0c1427] to-blue-950/90 border-2 border-cyan-500/80 rounded-2xl p-5 shadow-[0_0_30px_-5px_rgba(6,182,212,0.35)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase bg-cyan-400 text-slate-950 shadow-md flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>COMPETITION DEMO MODE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300">
                JUDGES DEMONSTRATION SUITE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 border border-emerald-700 text-emerald-300">
                SANDBOX ISOLATED · REAL USER DATA SAFE
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight pt-1">
              End-to-End Ergonomic Telemetry Demonstration (Steps 1–10)
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Experience the complete HumanAugment AI architectural flow without physical ESP32 hardware. All simulated signals pass through the production <code className="text-cyan-300 font-mono">IAnalyticsEngine</code> pipeline for validation, cleaning, feature extraction, REBA posture scoring, and explainable risk synthesis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleResetDemo}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Flow</span>
            </button>
          </div>
        </div>

        {/* 10-Step Interactive Breadcrumb Stepper */}
        <div className="mt-5 pt-4 border-t border-cyan-800/40 overflow-x-auto pb-1">
          <div className="flex items-center min-w-max gap-2 text-xs font-mono">
            {stepsMeta.map((s, idx) => {
              const isPast = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950/50'
                      : isPast
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/60'
                      : 'bg-slate-900/70 text-slate-500 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? 'bg-slate-950 text-cyan-300'
                        : isPast
                        ? 'bg-cyan-800 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPast ? '✓' : s.step}
                  </span>
                  <span className="whitespace-nowrap font-sans text-[11px]">
                    Step {s.step}: {s.title}
                  </span>
                  {idx < stepsMeta.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-600 opacity-60 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Control & Stepper Guide, Right Live Visualizer & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Step Controller (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Step Explainer Card */}
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">
                  STEP {currentStep} OF 10
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {stepsMeta[currentStep - 1]?.tag}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                DEMO READY
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-sans">
                {stepsMeta[currentStep - 1]?.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {stepsMeta[currentStep - 1]?.desc}
              </p>
            </div>

            {/* STEP 1: Hardware State Verification */}
            {currentStep === 1 && (
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Assigned Pod:</span>
                  <span className="text-white font-bold">ESP32-BIO-SIMULATED-01</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Device State:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    SIMULATED
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Connection Bus:</span>
                  <span className="text-slate-300">Virtual Hardware Bridge (Loopback)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Firmware Standard:</span>
                  <span className="text-emerald-400">v2.4.0-esp32-protocol</span>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-sans flex items-center justify-center gap-2 transition-colors shadow-md shadow-cyan-950/50"
                >
                  <span>Proceed to Step 2: Select Activity</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Activity Selection */}
            {currentStep === 2 && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 gap-2">
                  {activities.map(act => (
                    <button
                      key={act.id}
                      onClick={() => setSelectedActivity(act.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedActivity === act.id
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                          : 'bg-[#0e1424] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{act.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                          {act.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                        {act.description}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full mt-3 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-sans flex items-center justify-center gap-2 transition-colors shadow-md shadow-cyan-950/50"
                >
                  <span>Lock Activity & Proceed to Step 3</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: Start Monitoring */}
            {currentStep === 3 && (
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-4">
                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  Click below to initiate the active pipeline. Live 10-axis sensor packets will begin streaming to the real-time analytics pipeline at <strong className="text-cyan-400">{sampleHz} Hz</strong>.
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Sampling Rate:</span>
                  <div className="flex gap-1.5">
                    {[5, 10, 20].map(hz => (
                      <button
                        key={hz}
                        onClick={() => setSampleHz(hz)}
                        className={`px-2.5 py-1 rounded text-xs ${
                          sampleHz === hz ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {hz} Hz
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartMonitoring}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-sans flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Monitoring Session</span>
                </button>
              </div>
            )}

            {/* STEPS 4 - 8: Live Monitoring Active Controls */}
            {currentStep >= 4 && currentStep <= 8 && (
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Stream Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE PIPELINE ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Session Elapsed:</span>
                  <span className="text-rose-400 font-bold text-sm tabular-nums">
                    {formatTimer(sessionSeconds)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Active Exertion Tier:</span>
                  <span className="text-cyan-300 font-bold uppercase">{selectedActivity.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Triggered Alerts:</span>
                  <span className="text-amber-400 font-bold tabular-nums">{demoAlerts.length} events</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setCurrentStep(prev => Math.min(9, prev + 1))}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-[11px] font-sans transition-colors"
                  >
                    Next Step ({currentStep + 1})
                  </button>

                  <button
                    onClick={() => setCurrentStep(9)}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] font-sans transition-colors shadow-md shadow-rose-950/50"
                  >
                    Jump to End Session
                  </button>
                </div>
              </div>
            )}

            {/* STEP 9: End Session Prompt */}
            {currentStep === 9 && (
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-4">
                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  Conclude data collection. The analytics engine will synthesize total time in risky postures, Karvonen heart rate load, muscle fatigue peaks, and calculate the overall risk matrix.
                </div>

                <button
                  onClick={handleEndSession}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs font-sans flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-950/50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conclude & Generate Formal Summary (Step 10)</span>
                </button>
              </div>
            )}

            {/* STEP 10: Reset / Re-run */}
            {currentStep === 10 && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstration Complete</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  The session summary, fatigue score, movement score, posture risk, overall risk, and actionable ergonomics recommendations have been synthesized on the right.
                </p>
                <button
                  onClick={handleResetDemo}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-sans flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Competition Demonstration Trial</span>
                </button>
              </div>
            )}
          </div>

          {/* Real-time Physiological Gauges in Current State */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold pb-2 border-b border-slate-800">
              Pipeline Live Feature Extraction
            </h4>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                  <span>Heart Rate</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-1 tabular-nums">
                  {liveReading.heart_rate} <span className="text-[10px] text-slate-500 font-normal">BPM</span>
                </div>
                <div className="text-[10px] text-rose-400 mt-1">
                  Reserve: {liveMetrics.heartRateLoad}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                  <span>Muscle EMG</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-300 mt-1 tabular-nums">
                  {liveReading.muscle_activity}% <span className="text-[10px] text-slate-500 font-normal">MVC</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Recruitment Envelope
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                  <span>Joint Flexion</span>
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-1 tabular-nums">
                  {liveReading.joint_angle.toFixed(1)}°
                </div>
                <div className="text-[10px] text-amber-400 mt-1 uppercase font-bold">
                  {liveMetrics.postureStatus.replace('_', ' ')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
                  <span>Estimated Fatigue</span>
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">
                  {liveMetrics.fatigueScore} <span className="text-[10px] text-slate-500 font-normal">/100</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                  {liveMetrics.fatigueLevel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Visualizer or Final Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* STEP 10: Comprehensive Formal Session Summary */}
          {currentStep === 10 && completedDemoSession ? (
            <div className="bg-[#0b0f19] border-2 border-emerald-500/80 rounded-2xl p-6 lg:p-7 shadow-2xl space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    <span>STEP 10 COMPLETE · FORMAL SESSION AUDIT SUMMARY</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight mt-1 font-sans">
                    {completedDemoSession.title}
                  </h2>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-slate-400">Duration: {completedDemoSession.durationSeconds}s</div>
                  <div className="text-cyan-400 font-bold">DEVICE: SIMULATED POD</div>
                </div>
              </div>

              {/* Core Scorecards Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Fatigue Score</span>
                  <div className="text-2xl font-black text-amber-400 mt-1 tabular-nums">
                    {completedDemoSession.summary.avgFatigueScore}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Peak: {completedDemoSession.summary.peakFatigueScore}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Movement Score</span>
                  <div className="text-2xl font-black text-cyan-300 mt-1 tabular-nums">
                    {completedDemoSession.summary.movementScore}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Kinematic Quality
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase block">Posture Risk</span>
                  <div className="text-2xl font-black text-rose-400 mt-1 tabular-nums">
                    {completedDemoSession.summary.avgPostureScore}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-rose-400 mt-1">
                    {completedDemoSession.summary.timeInHighRiskPostureSeconds}s &gt; 45°
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1424] border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] uppercase block">Overall Risk</span>
                  <div className="mt-1">
                    <RiskIndicator level={completedDemoSession.summary.overallRisk} size="lg" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {completedDemoSession.summary.alertsCount} alerts triggered
                  </div>
                </div>
              </div>

              {/* Ergonomics Recommendations */}
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  Explainable Decision Support Recommendations
                </h4>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Pacing & Rest:</strong> Operator exceeded ergonomic fatigue threshold ({completedDemoSession.summary.avgFatigueScore}/100). Implement 10-minute active recovery pause.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Workstation Elevation:</strong> Measured {completedDemoSession.summary.timeInHighRiskPostureSeconds}s of sustained awkward spinal flexion. Elevate material staging conveyor to minimize lumbar strain.
                    </span>
                  </div>
                </div>
              </div>

              {/* Triggered Incident Alerts Log in Demo */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mb-2">
                  Session Incident Triggers ({demoAlerts.length})
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {demoAlerts.map(alt => (
                    <div
                      key={alt.id}
                      className="p-3 rounded-xl bg-[#111726] border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              alt.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{alt.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-sans">
                          {alt.description}
                        </p>
                      </div>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded font-bold shrink-0 bg-slate-800 text-slate-300">
                        {alt.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Live Demonstration Monitoring View (Steps 1 to 9) */
            <div className="space-y-5">
              {/* 2D Biomechanical Skeletal Wireframe & Risk Synthesizer */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                  <BiomechanicalWireframe
                    jointAngle={liveReading.joint_angle}
                    postureStatus={liveMetrics.postureStatus}
                    muscleActivity={liveReading.muscle_activity}
                    physicalLoad={liveReading.pressure}
                  />
                </div>

                <div className="md:col-span-5 bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
                      <span className="text-slate-400 uppercase">Risk Synthesizer</span>
                      <span className="text-[10px] text-cyan-400 font-bold">REBA / ISO 11226</span>
                    </div>

                    <div className="space-y-2.5 mt-3 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Overall Risk:</span>
                        <RiskIndicator level={liveMetrics.overallRisk} size="md" />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Posture Tier:</span>
                        <RiskIndicator level={liveMetrics.postureStatus} size="sm" />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Fatigue Level:</span>
                        <span className="font-bold uppercase text-amber-400">
                          {liveMetrics.fatigueLevel}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Smoothness:</span>
                        <span className="font-bold text-cyan-300">
                          {liveMetrics.movementScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-[11px] text-slate-300 leading-tight">
                    <span className="text-cyan-400 font-bold block mb-0.5">Automated Advisory:</span>
                    {liveMetrics.recommendedAction}
                  </div>
                </div>
              </div>

              {/* Multi-Channel Waveform Oscilloscope */}
              <div className="space-y-4">
                <WaveformChart
                  title="Cardiovascular Reserve (Heart Rate)"
                  data={readingsHistory}
                  height={150}
                  channels={[
                    { key: 'heart_rate', name: 'Heart Rate', color: '#f43f5e', unit: 'BPM', min: 45, max: 180 },
                  ]}
                />

                <WaveformChart
                  title="Surface Electromyography (EMG Recruitment)"
                  data={readingsHistory}
                  height={150}
                  channels={[
                    { key: 'muscle_activity', name: 'Muscle EMG', color: '#06b6d4', unit: '% MVC', min: 0, max: 100 },
                  ]}
                />

                <WaveformChart
                  title="Kinematic Spinal Trunk Flexion Angle & Dynamic Acc"
                  data={readingsHistory}
                  height={150}
                  channels={[
                    { key: 'joint_angle', name: 'Trunk Flexion (θ)', color: '#eab308', unit: '°', min: 0, max: 80 },
                    { key: 'acc_z', name: 'Acc Z (Vertical)', color: '#10b981', unit: 'm/s²', min: 0, max: 20 },
                  ]}
                />
              </div>

              {/* Live Incident Alerts Stream */}
              {demoAlerts.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Real-Time Triggered Incidents ({demoAlerts.length})</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {demoAlerts.map(alt => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800 flex items-center justify-between gap-3 text-slate-200"
                      >
                        <div className="truncate">
                          <span className="font-bold text-rose-300">[{alt.category}]</span>{' '}
                          <span>{alt.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(alt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
