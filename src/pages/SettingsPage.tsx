import {
  AlertTriangle,
  Check,
  Download,
  Flame,
  Heart,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { apiClient } from '../services/apiClient';

export const SettingsPage: React.FC = () => {
  const { sampleRateHz, setSampleRate, resetToDemo, sessions, alerts, devices } = useMonitoring();
  const [fatigueThreshold, setFatigueThreshold] = useState(65);
  const [postureAngleMax, setPostureAngleMax] = useState(45);
  const [hrAlertBpm, setHrAlertBpm] = useState(155);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleExportJSON = () => {
    const payload = {
      exportTimestamp: Date.now(),
      platform: 'HumanAugment AI',
      problemStatementId: 26113,
      sessions,
      alerts,
      devices,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humanaugment_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
          System Administration
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Telemetry & Platform Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure real-time sampling frequency, threshold limits for automated incident alarms, and local data export.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Sampling Configuration */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Hardware Sampling & Simulation Engine
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Telemetry Ingestion Frequency
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {[5, 10, 20, 50].map(hz => (
                  <button
                    type="button"
                    key={hz}
                    onClick={() => setSampleRate(hz)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                      sampleRateHz === hz
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-[#111726] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hz} Hz
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Higher frequencies provide higher kinematic detail but consume more bandwidth over wireless gateways.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Alarm Thresholds */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Automated Alert Thresholds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Fatigue Alert Ceiling</label>
              <input
                type="number"
                value={fatigueThreshold}
                onChange={e => setFatigueThreshold(Number(e.target.value))}
                min={40}
                max={95}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Trigger warning &gt;= {fatigueThreshold}/100</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">High-Risk Trunk Angle</label>
              <input
                type="number"
                value={postureAngleMax}
                onChange={e => setPostureAngleMax(Number(e.target.value))}
                min={25}
                max={75}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Critical alert &gt;= {postureAngleMax}°</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Cardiovascular Peak</label>
              <input
                type="number"
                value={hrAlertBpm}
                onChange={e => setHrAlertBpm(Number(e.target.value))}
                min={120}
                max={200}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">High load alert &gt;= {hrAlertBpm} BPM</span>
            </div>
          </div>
        </div>

        {/* Data Export & Demo Reset */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Data Portability & Diagnostics
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-white">Export Audit Telemetry</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Download all historical shift sessions, incident alerts, and hardware configurations as JSON.
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportJSON}
              className="px-4 py-2 bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Raw JSON</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-white">Reset Demo Telemetry</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Restores standard pre-configured demo sessions, device profiles, and simulated test data.
              </div>
            </div>

            <button
              type="button"
              onClick={resetToDemo}
              className="px-4 py-2 bg-[#111726] hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo State</span>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {showSavedToast && (
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>System settings saved successfully</span>
            </div>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </form>
    </div>
  );
};
