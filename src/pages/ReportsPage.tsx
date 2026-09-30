import {
  Activity,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  Heart,
  Printer,
  Shield,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { RiskIndicator } from '../components/common/RiskBadge';
import { useAuth } from '../context/AuthContext';
import { useMonitoring } from '../context/MonitoringContext';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { sessions, selectedDevice } = useMonitoring();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions.length > 0 ? sessions[0].id : ''
  );

  const currentSession =
    sessions.find(s => s.id === selectedSessionId) || (sessions.length > 0 ? sessions[0] : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header controls (hidden on print) */}
      <div className="no-print bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
            Audit & Compliance Engine
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Ergonomic Compliance & Shift Performance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal documentation for human factors review, safety compliance, and operator workload limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(e.target.value)}
            className="bg-[#111726] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.activityType.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Report Document */}
      {currentSession ? (
        <div className="print-card bg-[#0b0f19] border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-slate-700/80 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-bold">
                  HA
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  HumanAugment AI · Biomechanical Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Hardware Statement ID 26113 · Industrial Ergonomics Decision Support
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-400">
              <div>REPORT ID: HA-AUD-{currentSession.id.toUpperCase()}</div>
              <div>DATE: {new Date(currentSession.startTime).toLocaleDateString()}</div>
              <div>STATUS: AUDITED & SYNTHESIZED</div>
            </div>
          </div>

          {/* Session Overview Section */}
          <div>
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
              1.0 Session Overview & Hardware Assignment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0e1424] border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Worker Name</span>
                <span className="text-white font-semibold">{user?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Department</span>
                <span className="text-slate-300">{user?.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Hardware Unit</span>
                <span className="text-cyan-300 truncate block">{currentSession.deviceName}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Shift Duration</span>
                <span className="text-slate-200">
                  {Math.round(currentSession.durationSeconds / 60)} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Biomechanical Metric Matrix */}
          <div>
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
              2.0 Quantitative Biomechanical Matrix
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Cardiovascular (HR)
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {currentSession.summary.avgHeartRate}{' '}
                  <span className="text-xs text-slate-400 font-normal">avg BPM</span>
                </div>
                <div className="text-[11px] font-mono text-rose-400 mt-1">
                  Peak: {currentSession.summary.peakHeartRate} BPM
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Mean Muscle Activation
                </span>
                <div className="text-2xl font-bold font-mono text-cyan-300 mt-1 tabular-nums">
                  {currentSession.summary.avgMuscleActivity}%{' '}
                  <span className="text-xs text-slate-400 font-normal">MVC</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Peak EMG: {currentSession.summary.peakMuscleActivity}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Estimated Fatigue Index
                </span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                  {currentSession.summary.avgFatigueScore}{' '}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Peak Fatigue: {currentSession.summary.peakFatigueScore}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  High-Risk Posture (&gt;40°)
                </span>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
                  {currentSession.summary.timeInHighRiskPostureSeconds}s
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  REBA Score: {currentSession.summary.avgPostureScore}/100
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Kinematic Smoothness
                </span>
                <div className="text-2xl font-bold font-mono text-indigo-300 mt-1 tabular-nums">
                  {currentSession.summary.movementScore}{' '}
                  <span className="text-xs text-slate-400 font-normal">/100</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {currentSession.summary.totalRepetitions} repetitive cycles
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Overall Synthesized Risk
                </span>
                <div className="mt-1">
                  <RiskIndicator level={currentSession.summary.overallRisk} size="lg" />
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {currentSession.summary.alertsCount} incident triggers logged
                </div>
              </div>
            </div>
          </div>

          {/* Ergonomic Recommendations & Action Plan */}
          <div>
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
              3.0 Recommendations & Corrective Interventions
            </h3>
            <div className="p-5 rounded-xl bg-[#0e1424] border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Workstation Pacing Adjustment:</span>{' '}
                  Maintain single-lift payloads under 25 kg. For cycles exceeding 40 repetitions per shift, introduce mandatory 5-minute micro-breaks.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Spinal Flexion Mitigation:</span>{' '}
                  Worker experienced {currentSession.summary.timeInHighRiskPostureSeconds} seconds of trunk bend exceeding 40°. Recommend elevation of pallet staging conveyor by 18 cm.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Task Rotation Strategy:</span>{' '}
                  Rotate operator to passive assembly or automated sorting station when estimated fatigue index exceeds 65/100.
                </div>
              </div>
            </div>
          </div>

          {/* Legal Non-Diagnostic Disclosure */}
          <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-mono leading-relaxed">
            NOTICE: This report is an engineering risk assessment tool for industrial ergonomics, worker biomechanical pacing, and decision support. It does not provide, nor is it intended to provide, a medical diagnosis of any condition or pathology.
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 font-mono text-xs">
          No recording sessions available to generate reports.
        </div>
      )}
    </div>
  );
};
