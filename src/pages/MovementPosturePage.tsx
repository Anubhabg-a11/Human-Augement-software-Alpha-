import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Compass,
  Cpu,
  Layers,
  Repeat,
  Shield,
  Zap,
} from 'lucide-react';
import React from 'react';
import { BiomechanicalWireframe } from '../components/common/BiomechanicalWireframe';
import { RiskIndicator } from '../components/common/RiskBadge';
import { useMonitoring } from '../context/MonitoringContext';

export const MovementPosturePage: React.FC = () => {
  const { latestReading, latestMetrics } = useMonitoring();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
          Kinematic Ergonomics
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Movement Quality & Biomechanical Posture Risk
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Real-time tracking of spinal trunk flexion angles, cyclical repetition count, kinematic jerk anomalies, and ergonomic posture risk inspired by Rapid Entire Body Assessment (REBA) standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Wireframe Visualizer & Angle Readout */}
        <div className="lg:col-span-5 space-y-4">
          <BiomechanicalWireframe
            jointAngle={latestReading.joint_angle}
            postureStatus={latestMetrics.postureStatus}
            muscleActivity={latestReading.muscle_activity}
            physicalLoad={latestReading.pressure}
          />

          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="text-slate-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
              Joint Angle Risk Evaluation
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Flexion Angle:</span>
              <span className="text-white font-bold tabular-nums">{latestReading.joint_angle.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Posture Risk Score:</span>
              <span className="text-cyan-300 font-bold tabular-nums">{latestMetrics.postureRiskScore}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ergonomic Status:</span>
              <RiskIndicator level={latestMetrics.postureStatus} />
            </div>
          </div>
        </div>

        {/* Right: Movement Metrics, Repetition Tracker & REBA Scale */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase">Movement Score</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-white tabular-nums">
                {latestMetrics.movementScore} <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2">
                Kinematic fluidity & smoothness
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase">Repetition Cycles</span>
                <Repeat className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-white tabular-nums">
                {latestMetrics.repetitionCount}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2">
                Periodic lifting cycles detected
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase">Kinematic Anomalies</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
                {latestMetrics.abnormalMovementEvents}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-2">
                Jerk spikes (&gt;14 m/s³)
              </div>
            </div>
          </div>

          {/* REBA Ergonomic Standard Scale */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                Ergonomic Trunk Posture Guidelines (REBA Benchmark)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">ISO 11226 Standard</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-300 font-mono">0° – 20° Flexion: Safe Neutral Posture</div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Trunk is upright with minimal musculoskeletal moment arm on spinal vertebrae. Nominal worker operating state.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-300 font-mono">21° – 45° Flexion: Attention Required</div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Moderate forward reaching or bending. Prolonged exposure causes erector spinae strain. Worker rotation recommended.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-300 font-mono">&gt; 45° Flexion: High Risk Exposure</div>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                    Severe lumbosacral disc compression and shear stress. Immediate posture correction or mechanical lifting aid required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
