import {
  Activity,
  AlertCircle,
  Clock,
  Flame,
  Heart,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React from 'react';
import { RiskIndicator } from '../components/common/RiskBadge';
import { useMonitoring } from '../context/MonitoringContext';

export const FatigueAnalysisPage: React.FC = () => {
  const { latestMetrics, latestReading, currentActivity } = useMonitoring();

  // Multi-signal contribution breakdown
  const hrContribution = Math.round(latestMetrics.heartRateLoad * 0.3);
  const muscleContribution = Math.round(latestMetrics.muscleActivity * 0.3);
  const loadContribution = Math.round(Math.min(100, (latestReading.pressure / 35) * 100) * 0.2);
  const intensityContribution = Math.round(latestMetrics.activityIntensity * 0.2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
          Physiological Fatigue Model
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Multi-Signal Fatigue Estimation & Recovery Pacing
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Estimates cumulative physiological and localized muscular strain across 0–100 scale using continuous cardiovascular reserve, electromyographic activation, manual load pressure, and shift exposure duration.
        </p>
      </div>

      {/* Main Fatigue Score Gauge & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#0b0f19] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
            Estimated Fatigue Index
          </div>

          {/* Radial score ring display */}
          <div className="relative w-48 h-48 flex items-center justify-center my-2">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke={
                  latestMetrics.fatigueScore > 75
                    ? '#f43f5e'
                    : latestMetrics.fatigueScore > 50
                    ? '#f59e0b'
                    : '#06b6d4'
                }
                strokeWidth="12"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * latestMetrics.fatigueScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-extrabold font-mono text-white tabular-nums">
                {latestMetrics.fatigueScore}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-1.5">
            <RiskIndicator level={latestMetrics.fatigueLevel} size="lg" />
            <span className="text-xs text-slate-400 font-mono">
              Classification Range: {latestMetrics.fatigueScore <= 25 ? '0-25 Low' : latestMetrics.fatigueScore <= 50 ? '26-50 Mild' : latestMetrics.fatigueScore <= 75 ? '51-75 Moderate' : '76-100 High'}
            </span>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-slate-800 text-xs text-slate-300 bg-[#0e1424] p-3 rounded-lg border border-slate-750">
            <div className="font-semibold text-white mb-1 flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended Action:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {latestMetrics.recommendedAction}
            </p>
          </div>
        </div>

        {/* Contributing Factors & Multi-Signal Weights */}
        <div className="lg:col-span-7 bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Multi-Signal Synthesis Contributors
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">Weighted Fusion Formula</span>
          </div>

          <div className="space-y-4">
            {/* Factor 1: Heart Rate Load */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cardiovascular Load (30% weight)</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {latestMetrics.heartRateLoad}% reserve (+{hrContribution} pts)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${latestMetrics.heartRateLoad}%` }}
                />
              </div>
            </div>

            {/* Factor 2: Muscle EMG */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sustained Muscle Recruitment (30% weight)</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {latestMetrics.muscleActivity.toFixed(0)}% MVC (+{muscleContribution} pts)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${latestMetrics.muscleActivity}%` }}
                />
              </div>
            </div>

            {/* Factor 3: Physical Load */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>External Handling Load (20% weight)</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {latestReading.pressure.toFixed(1)} kg (+{loadContribution} pts)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (latestReading.pressure / 35) * 100)}%` }}
                />
              </div>
            </div>

            {/* Factor 4: Activity Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kinematic Movement Intensity (20% weight)</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {latestMetrics.activityIntensity}% (+{intensityContribution} pts)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${latestMetrics.activityIntensity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Contributors List */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 mb-2">Primary Drivers of Current Fatigue:</div>
            <div className="space-y-1.5">
              {latestMetrics.fatigueContributors.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
