import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  FileText,
  Flame,
  Heart,
  Play,
  Radio,
  RotateCcw,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import React from 'react';
import { BiomechanicalWireframe } from '../components/common/BiomechanicalWireframe';
import { RiskBadge, RiskIndicator } from '../components/common/RiskBadge';
import { WaveformChart } from '../components/common/WaveformChart';
import { useAuth } from '../context/AuthContext';
import { useMonitoring } from '../context/MonitoringContext';
import { NavItem } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: NavItem) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    latestReading,
    readingsBuffer,
    latestMetrics,
    currentActivity,
    isSessionActive,
    activeSession,
    startSession,
    endSession,
    alerts,
    markAlertRead,
    selectedDevice,
    sessions,
  } = useMonitoring();

  const unreadAlerts = alerts.filter(a => !a.isRead).slice(0, 3);

  // Overall risk color accent
  const isHighRisk = latestMetrics.overallRisk === 'high';
  const isModerateRisk = latestMetrics.overallRisk === 'moderate';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Risk Alert Banner if elevated */}
      {(isHighRisk || isModerateRisk) && (
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isHighRisk
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isHighRisk ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'
              }`}
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono uppercase tracking-wider">
                {isHighRisk ? 'CRITICAL ERGONOMIC INTERVENTION REQUIRED' : 'ELEVATED WORKLOAD ATTENTION'}
              </div>
              <div className="text-xs mt-0.5 opacity-90 leading-relaxed font-sans">
                {latestMetrics.recommendedAction}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('fatigue')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold whitespace-nowrap transition-colors border border-white/10 shrink-0"
          >
            Review Risk Matrix →
          </button>
        </div>
      )}

      {/* Top Console Bar - Generously Sized Vertically */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl transition-colors">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 dark:text-cyan-400 light:text-cyan-700 uppercase tracking-wider font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Operator #{user?.uid ? user.uid.substring(0, 8) : '26113'}</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight font-sans">
            Biomechanical Ergonomics & Performance Console
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Real-time multi-sensor telemetry fusion & REBA posture ergonomic tracking
          </p>
        </div>

        {/* Shift Recording Action & Demo Launcher */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <button
            onClick={() => onNavigate('competition-demo')}
            className="px-5 py-3.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/60 text-cyan-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 shadow-md shadow-cyan-950/40"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Launch Competition Demo Mode</span>
          </button>

          {isSessionActive ? (
            <div className="flex items-center gap-4 bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl p-3 shadow-md">
              <div>
                <div className="flex items-center gap-2 text-xs text-rose-400 font-mono font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>RECORDING SESSION</span>
                </div>
                <div className="text-xs text-slate-400 truncate max-w-[190px] font-sans mt-0.5">
                  {activeSession?.title}
                </div>
              </div>
              <button
                onClick={() => endSession()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Complete Shift
              </button>
            </div>
          ) : (
            <button
              onClick={() => startSession(`Shift Session · ${currentActivity.toUpperCase()}`)}
              className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 shadow-lg shadow-cyan-950/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Record Shift Session</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Core Overview Cards (Immediate Visual Hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Overall Risk (Hero Card) */}
        <div
          className={`bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all duration-200 ${
            isHighRisk
              ? 'border-rose-500/50 shadow-[0_0_20px_-3px_rgba(244,63,94,0.25)]'
              : isModerateRisk
              ? 'border-amber-500/50 shadow-[0_0_20px_-3px_rgba(245,158,11,0.2)]'
              : 'border-slate-800/80 dark:border-slate-800/80 light:border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="uppercase text-[10px] font-mono tracking-wider font-bold">Overall Risk</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {latestMetrics.overallRiskScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/100</span>
            </div>
            <div className="mt-2">
              <RiskBadge level={latestMetrics.overallRisk} size="sm" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 truncate">
            Formula: 30F + 30P + 20M + 20L
          </div>
        </div>

        {/* 2. Fatigue Level */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="uppercase text-[10px] font-mono tracking-wider font-bold">Fatigue Index</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {latestMetrics.fatigueScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/100</span>
            </div>
            <div className="mt-2">
              <RiskBadge level={latestMetrics.fatigueLevel} size="sm" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100">
            {latestMetrics.fatigueScore > 70 ? 'Recovery Mandatory' : 'Metabolic Equilibrium'}
          </div>
        </div>

        {/* 3. Current Activity */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="uppercase text-[10px] font-mono tracking-wider font-bold">Activity</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white dark:text-white light:text-slate-900 uppercase font-sans truncate">
              {currentActivity.replace('_', ' ')}
            </div>
            <div className="text-xs font-mono text-cyan-400 dark:text-cyan-400 light:text-cyan-700 mt-1 font-semibold">
              Intensity: {latestMetrics.activityIntensity}%
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100">
            Sample: {readingsBuffer.length} window
          </div>
        </div>

        {/* 4. Heart Rate */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="uppercase text-[10px] font-mono tracking-wider font-bold">Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {latestReading.heart_rate}
              </span>
              <span className="text-xs font-mono text-slate-500">BPM</span>
            </div>
            <div className="text-xs font-mono text-slate-300 dark:text-slate-300 light:text-slate-700 mt-1 flex items-center gap-1">
              {latestReading.heart_rate > 115 ? (
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Reserve: {latestMetrics.heartRateLoad}%</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100">
            Resting: {user?.restingHeartRate || 65} BPM
          </div>
        </div>

        {/* 5. Posture Risk */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="uppercase text-[10px] font-mono tracking-wider font-bold">Posture Risk</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {latestReading.joint_angle.toFixed(0)}°
              </span>
              <span className="text-xs font-mono text-slate-500">flex</span>
            </div>
            <div className="mt-2">
              <RiskBadge level={latestMetrics.postureStatus} size="sm" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100">
            REBA index: {latestMetrics.postureRiskScore}/100
          </div>
        </div>

        {/* 6. Device Status */}
        <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="uppercase text-[10px] font-mono tracking-wider font-bold">Hardware Pod</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white dark:text-white light:text-slate-900 truncate">
              {selectedDevice?.deviceName || 'Wearable Rig'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold">
              <BatteryCharging className="w-4 h-4" />
              <span>{selectedDevice?.batteryLevel ?? 94}% Battery</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex justify-between">
            <span>{selectedDevice?.connectionType || 'BLE 5.2'}</span>
            <span className="text-cyan-400 font-bold">{selectedDevice?.status}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Waveform Oscilloscope & Biomechanical Wireframe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Oscilloscope Charts */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-wide font-sans">
                Real-Time Bio-Kinematic Telemetry Stream
              </h2>
            </div>
            <button
              onClick={() => onNavigate('live-monitoring')}
              className="text-xs text-cyan-400 dark:text-cyan-400 light:text-cyan-700 hover:underline flex items-center gap-1 font-mono font-semibold"
            >
              <span>Full Oscilloscope View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <WaveformChart
            title="Cardiovascular (HR) & Muscle Electromyography (EMG)"
            data={readingsBuffer}
            height={165}
            channels={[
              { key: 'heart_rate', name: 'Heart Rate', color: '#f43f5e', unit: 'BPM', min: 45, max: 180 },
              { key: 'muscle_activity', name: 'Muscle Activation', color: '#06b6d4', unit: '% MVC', min: 0, max: 100 },
              { key: 'pressure', name: 'Load Pressure', color: '#eab308', unit: 'kg', min: 0, max: 40 },
            ]}
          />

          <WaveformChart
            title="3-Axis IMU Acceleration (Linear Kinematics)"
            data={readingsBuffer}
            height={145}
            channels={[
              { key: 'acc_x', name: 'Acc X (Lateral)', color: '#38bdf8', unit: 'm/s²', min: -12, max: 12 },
              { key: 'acc_y', name: 'Acc Y (Forward)', color: '#c084fc', unit: 'm/s²', min: -12, max: 12 },
              { key: 'acc_z', name: 'Acc Z (Vertical)', color: '#10b981', unit: 'm/s²', min: 0, max: 22 },
            ]}
          />

          {/* Decision Support & Biomechanical Explanation */}
          <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 shadow-md">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold mb-2">
              Decision Support & Risk Rationale
            </div>
            <div className="text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 mb-3 leading-relaxed">
              <span className="font-bold text-white dark:text-white light:text-slate-900">Recommended Ergonomic Action: </span>
              {latestMetrics.recommendedAction}
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-600">
                Primary contributing factors detected:
              </div>
              <ul className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 space-y-1">
                {latestMetrics.riskContributors.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Biomechanical Rig & Alerts Feed */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans">
                  Skeletal Posture Rig
                </h2>
              </div>
              <button
                onClick={() => onNavigate('movement')}
                className="text-xs text-cyan-400 dark:text-cyan-400 light:text-cyan-700 hover:underline flex items-center gap-1 font-mono"
              >
                <span>REBA Scale</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <BiomechanicalWireframe
              jointAngle={latestReading.joint_angle}
              postureStatus={latestMetrics.postureStatus}
              muscleActivity={latestReading.muscle_activity}
              physicalLoad={latestReading.pressure}
            />
          </div>

          {/* Active Safety Alerts Micro-Feed */}
          <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase tracking-wider font-mono">
                  Active Alerts ({unreadAlerts.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-cyan-400 dark:text-cyan-400 light:text-cyan-700 hover:underline font-mono"
              >
                View all
              </button>
            </div>

            {unreadAlerts.length === 0 ? (
              <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 py-6 text-center font-mono flex flex-col items-center gap-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-80" />
                <span>No active alerts. Telemetry nominal.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {unreadAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                        {alert.title}
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 text-[10px] font-mono">
                      <span className="text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => markAlertRead(alert.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
