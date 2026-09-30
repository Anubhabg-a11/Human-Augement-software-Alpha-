import {
  Activity,
  Compass,
  Cpu,
  Flame,
  Heart,
  Maximize2,
  Radio,
  Sliders,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { BiomechanicalWireframe } from '../components/common/BiomechanicalWireframe';
import { RiskIndicator } from '../components/common/RiskBadge';
import { WaveformChart } from '../components/common/WaveformChart';
import { useMonitoring } from '../context/MonitoringContext';

export const LiveMonitoringPage: React.FC = () => {
  const {
    latestReading,
    readingsBuffer,
    latestMetrics,
    currentActivity,
    selectedDevice,
    sampleRateHz,
  } = useMonitoring();

  const [activeTab, setActiveTab] = useState<'all' | 'biometric' | 'kinematic'>('all');

  return (
    <div className="space-y-6">
      {/* Header telemetry ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              Live Bio-Telemetry Stream
            </span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Real-Time Multi-Channel Oscilloscope & Ergonomic Rig
          </h1>
        </div>

        {/* Stream metadata */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-500 uppercase">Device:</span>{' '}
            <span className="text-slate-200">{selectedDevice?.deviceName}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase">Frequency:</span>{' '}
            <span className="text-cyan-400 font-bold">{sampleRateHz} Hz</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase">Status:</span>{' '}
            <span className="text-emerald-400">STREAMING</span>
          </div>
        </div>
      </div>

      {/* Main split viewport: Oscilloscope charts & 2D Biomechanical Wireframe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waveform Channels (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Channel selector filters */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b0f19] rounded-lg border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setActiveTab('biometric')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'biometric'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Biometric & EMG
            </button>
            <button
              onClick={() => setActiveTab('kinematic')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'kinematic'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6-DoF Kinematics
            </button>
          </div>

          {(activeTab === 'all' || activeTab === 'biometric') && (
            <WaveformChart
              title="Cardiovascular (HR) & Electromyography (EMG)"
              data={readingsBuffer}
              height={170}
              channels={[
                { key: 'heart_rate', name: 'Heart Rate', color: '#f43f5e', unit: 'BPM', min: 45, max: 180 },
                { key: 'muscle_activity', name: 'Muscle Activation', color: '#06b6d4', unit: '% MVC', min: 0, max: 100 },
                { key: 'pressure', name: 'Applied Load', color: '#eab308', unit: 'kg', min: 0, max: 40 },
              ]}
            />
          )}

          {(activeTab === 'all' || activeTab === 'kinematic') && (
            <>
              <WaveformChart
                title="Linear Acceleration (3-Axis Accelerometer)"
                data={readingsBuffer}
                height={150}
                channels={[
                  { key: 'acc_x', name: 'Acc X (Lateral)', color: '#38bdf8', unit: 'm/s²', min: -12, max: 12 },
                  { key: 'acc_y', name: 'Acc Y (Forward)', color: '#c084fc', unit: 'm/s²', min: -12, max: 12 },
                  { key: 'acc_z', name: 'Acc Z (Vertical)', color: '#10b981', unit: 'm/s²', min: 0, max: 22 },
                ]}
              />

              <WaveformChart
                title="Angular Velocity (3-Axis Gyroscope) & Joint Angle"
                data={readingsBuffer}
                height={150}
                channels={[
                  { key: 'gyro_x', name: 'Roll (Gyro X)', color: '#f97316', unit: '°/s', min: -150, max: 150 },
                  { key: 'gyro_y', name: 'Pitch (Gyro Y)', color: '#a855f7', unit: '°/s', min: -150, max: 150 },
                  { key: 'joint_angle', name: 'Trunk Flexion (θ)', color: '#ec4899', unit: '°', min: 0, max: 80 },
                ]}
              />
            </>
          )}

          {/* High-Precision Raw Sensor Telemetry Grid */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
              <h3 className="text-xs font-semibold text-white tracking-wider uppercase font-mono">
                Tabular Channel Readouts (Snapshot)
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                Timestamp: {new Date(latestReading.timestamp).toLocaleTimeString()}.{String(latestReading.timestamp % 1000).padStart(3, '0')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Heart Rate</div>
                <div className="text-lg font-bold text-rose-400 tabular-nums">
                  {latestReading.heart_rate} <span className="text-xs text-slate-500 font-normal">BPM</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Muscle EMG</div>
                <div className="text-lg font-bold text-cyan-400 tabular-nums">
                  {latestReading.muscle_activity.toFixed(1)} <span className="text-xs text-slate-500 font-normal">%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Joint Angle</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">
                  {latestReading.joint_angle.toFixed(1)} <span className="text-xs text-slate-500 font-normal">deg</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Surface Temp</div>
                <div className="text-lg font-bold text-amber-400 tabular-nums">
                  {latestReading.temperature.toFixed(1)} <span className="text-xs text-slate-500 font-normal">°C</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Acc X / Y / Z</div>
                <div className="text-xs font-bold text-slate-200 tabular-nums">
                  {latestReading.acc_x.toFixed(2)}, {latestReading.acc_y.toFixed(2)}, {latestReading.acc_z.toFixed(2)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Gyro X / Y / Z</div>
                <div className="text-xs font-bold text-slate-200 tabular-nums">
                  {latestReading.gyro_x.toFixed(1)}, {latestReading.gyro_y.toFixed(1)}, {latestReading.gyro_z.toFixed(1)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">External Load</div>
                <div className="text-lg font-bold text-sky-400 tabular-nums">
                  {latestReading.pressure.toFixed(1)} <span className="text-xs text-slate-500 font-normal">kg</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Acc Magnitude</div>
                <div className="text-lg font-bold text-slate-200 tabular-nums">
                  {latestMetrics.avgAcceleration.toFixed(2)} <span className="text-xs text-slate-500 font-normal">m/s²</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biomechanical Wireframe & Derived Ergonomics Rig (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <BiomechanicalWireframe
            jointAngle={latestReading.joint_angle}
            postureStatus={latestMetrics.postureStatus}
            muscleActivity={latestReading.muscle_activity}
            physicalLoad={latestReading.pressure}
          />

          {/* Real-time Risk Synthesizer */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
              Biomechanical Risk Synthesis
            </h3>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Fatigue:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white tabular-nums">
                  {latestMetrics.fatigueScore}/100
                </span>
                <RiskIndicator level={latestMetrics.fatigueLevel} />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Posture Classification:</span>
              <RiskIndicator level={latestMetrics.postureStatus} />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Kinematic Smoothness:</span>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                {latestMetrics.movementScore}/100
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Overall Ergonomic Tier:</span>
              <RiskIndicator level={latestMetrics.overallRisk} />
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <div className="font-semibold text-slate-300 mb-1">Observation:</div>
              {latestMetrics.recommendedAction}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
