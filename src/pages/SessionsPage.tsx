import {
  Activity,
  ArrowRight,
  Calendar,
  Clock,
  Compass,
  Cpu,
  Eye,
  FileText,
  Filter,
  Flame,
  Heart,
  Layers,
  Repeat,
  Shield,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { RiskIndicator } from '../components/common/RiskBadge';
import { useMonitoring } from '../context/MonitoringContext';
import { Session } from '../types';

export const SessionsPage: React.FC = () => {
  const { sessions } = useMonitoring();
  const [filterActivity, setFilterActivity] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const filteredSessions = sessions.filter(s => {
    if (filterActivity !== 'all' && s.activityType !== filterActivity) return false;
    if (filterRisk !== 'all' && s.summary.overallRisk !== filterRisk) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
          Historical Recording Registry
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Session Archive & Biomechanical Inspector
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Historical log of recorded worker shifts, simulated industrial cycles, and telemetry summaries. Filter by risk tier, device unit, or ergonomic activity.
        </p>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19] border border-slate-800 rounded-xl p-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Activity:</span>
          </div>
          <select
            value={filterActivity}
            onChange={e => setFilterActivity(e.target.value)}
            className="bg-[#111726] border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Activities</option>
            <option value="heavy_work">Heavy Work</option>
            <option value="repetitive_work">Repetitive Work</option>
            <option value="light_work">Light Work</option>
            <option value="walking">Walking</option>
            <option value="recovery">Recovery</option>
          </select>

          <div className="flex items-center gap-1.5 text-slate-400 ml-2">
            <span>Risk Tier:</span>
          </div>
          <select
            value={filterRisk}
            onChange={e => setFilterRisk(e.target.value)}
            className="bg-[#111726] border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Tiers</option>
            <option value="low">Low Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        <div className="text-slate-400 text-xs">
          Showing {filteredSessions.length} recorded sessions
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map(session => {
          const durationMin = Math.round(session.durationSeconds / 60) || 1;
          return (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="bg-[#0b0f19] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    {session.activityType.replace('_', ' ')}
                  </span>
                  <RiskIndicator level={session.summary.overallRisk} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1">
                  {session.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {session.notes || 'Full multi-channel telemetry session recorded and processed.'}
                </p>

                {/* Key Summary Stats */}
                <div className="grid grid-cols-3 gap-2 bg-[#0e1424] rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono mb-4">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Avg HR</span>
                    <span className="text-rose-400 font-bold tabular-nums">
                      {session.summary.avgHeartRate} BPM
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Fatigue</span>
                    <span className="text-amber-400 font-bold tabular-nums">
                      {session.summary.avgFatigueScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Posture</span>
                    <span className="text-cyan-400 font-bold tabular-nums">
                      {session.summary.avgPostureScore}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{durationMin} min</span>
                </span>
                <span className="text-cyan-400 flex items-center gap-1 group">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Inspector Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
                  <span>Session Inspection</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedSession.deviceId}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {selectedSession.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-6">
              {/* Top metadata stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px]">Duration</span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {Math.round(selectedSession.durationSeconds / 60)} min
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px]">Readings Count</span>
                  <div className="text-base font-bold text-cyan-400 mt-0.5 tabular-nums">
                    {selectedSession.readingsCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px]">Overall Risk</span>
                  <div className="mt-1">
                    <RiskIndicator level={selectedSession.summary.overallRisk} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-500 uppercase text-[10px]">Alerts Count</span>
                  <div className="text-base font-bold text-amber-400 mt-0.5 tabular-nums">
                    {selectedSession.summary.alertsCount}
                  </div>
                </div>
              </div>

              {/* Detailed Ergonomic Breakdown */}
              <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <h4 className="text-slate-400 uppercase text-[10px] pb-1 border-b border-slate-800">
                  Biomechanical Metric Summary
                </h4>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-slate-400">Mean / Peak Heart Rate:</div>
                  <div className="text-right text-rose-300 font-bold tabular-nums">
                    {selectedSession.summary.avgHeartRate} / {selectedSession.summary.peakHeartRate} BPM
                  </div>

                  <div className="text-slate-400">Mean Muscle Activity:</div>
                  <div className="text-right text-cyan-300 font-bold tabular-nums">
                    {selectedSession.summary.avgMuscleActivity}% MVC
                  </div>

                  <div className="text-slate-400">Fatigue Index (Avg / Peak):</div>
                  <div className="text-right text-amber-300 font-bold tabular-nums">
                    {selectedSession.summary.avgFatigueScore} / {selectedSession.summary.peakFatigueScore}
                  </div>

                  <div className="text-slate-400">Time in Risky Posture (&gt;40°):</div>
                  <div className="text-right text-rose-400 font-bold tabular-nums">
                    {selectedSession.summary.timeInHighRiskPostureSeconds} seconds
                  </div>

                  <div className="text-slate-400">Cycle Repetitions:</div>
                  <div className="text-right text-slate-200 font-bold tabular-nums">
                    {selectedSession.summary.totalRepetitions}
                  </div>

                  <div className="text-slate-400">Kinematic Anomalies:</div>
                  <div className="text-right text-slate-200 font-bold tabular-nums">
                    {selectedSession.summary.abnormalMovementCount}
                  </div>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="text-xs text-slate-300 bg-[#0f1422] p-3 rounded-lg border border-slate-800 leading-relaxed">
                  <span className="font-semibold text-white block mb-1">Shift Ergonomics Notes:</span>
                  {selectedSession.notes}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
