import {
  Activity,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useMonitoring } from '../../context/MonitoringContext';
import { ActivityType } from '../../types';

export const SimulationControlBar: React.FC = () => {
  const {
    simulatorState,
    currentActivity,
    sampleRateHz,
    startSimulator,
    pauseSimulator,
    stopSimulator,
    resetSimulator,
    setSimulatorActivity,
    setSampleRate,
    isSessionActive,
    activeSession,
    startSession,
    endSession,
  } = useMonitoring();

  // Active session timer counter
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    let timer: number | null = null;
    if (isSessionActive && activeSession) {
      const startMs = activeSession.startTime || Date.now();
      timer = window.setInterval(() => {
        setSessionSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, activeSession]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activities: { id: ActivityType; label: string; desc: string }[] = [
    { id: 'rest', label: 'Rest', desc: 'Baseline Ergonomics' },
    { id: 'walking', label: 'Walking', desc: 'Bipedal Gait' },
    { id: 'light_work', label: 'Light Work', desc: 'Manual Assembly' },
    { id: 'heavy_work', label: 'Heavy Work', desc: 'Pallet Transfer' },
    { id: 'repetitive_work', label: 'Repetitive', desc: 'Cyclic Picking' },
    { id: 'recovery', label: 'Recovery', desc: 'Active Respiration' },
  ];

  return (
    <aside
      aria-label="Simulation Status and Controls"
      className="w-full bg-[#0a0e17] dark:bg-[#0a0e17] light:bg-slate-100 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-5 lg:px-8 py-4 text-xs transition-colors duration-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {/* Left: Simulation & Hardware Bridge Telemetry Banner */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/70 dark:bg-cyan-950/70 light:bg-cyan-100 border border-cyan-800/70 text-cyan-300 dark:text-cyan-300 light:text-cyan-800 font-mono text-xs shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold tracking-wider">SIMULATION ENGINE</span>
          </div>

          <span className="text-slate-300 dark:text-slate-300 light:text-slate-600 text-xs hidden lg:inline font-medium">
            Deterministic Biomechanical Telemetry · ESP32 Bridge Standby
          </span>

          {/* Session Recording State with live timer */}
          {isSessionActive && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/80 dark:bg-rose-950/80 light:bg-rose-100 border border-rose-800/80 text-rose-300 dark:text-rose-300 light:text-rose-800 font-mono text-xs animate-pulse shrink-0 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold">RECORDING [{formatTimer(sessionSeconds)}]</span>
            </div>
          )}
        </div>

        {/* Right: Activity Selectors, Transport Controls, Sample Frequency */}
        <div className="flex items-center gap-3 shrink-0 ml-auto flex-wrap sm:flex-nowrap">
          {/* Activity Pills */}
          <div className="flex items-center gap-1.5 bg-[#111726] dark:bg-[#111726] light:bg-slate-200/80 p-1.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 shrink-0">
            {activities.map(act => {
              const isSelected = currentActivity === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setSimulatorActivity(act.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/50'
                  }`}
                  title={act.desc}
                >
                  {act.label}
                </button>
              );
            })}
          </div>

          {/* Transport Controls (Play / Pause / Stop / Reset) */}
          <div className="flex items-center gap-1.5 bg-[#111726] dark:bg-[#111726] light:bg-slate-200/80 p-1.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 shrink-0">
            {simulatorState === 'running' ? (
              <button
                onClick={pauseSimulator}
                className="p-2 rounded-lg text-amber-400 hover:bg-slate-800/60 transition-colors"
                title="Pause Telemetry Stream"
                aria-label="Pause Simulator"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startSimulator}
                className="p-2 rounded-lg text-emerald-400 hover:bg-slate-800/60 transition-colors"
                title="Start Telemetry Stream"
                aria-label="Start Simulator"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              onClick={stopSimulator}
              className={`p-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-rose-400 transition-colors ${
                simulatorState === 'stopped' ? 'opacity-40 pointer-events-none' : ''
              }`}
              title="Stop Simulator"
              aria-label="Stop Simulator"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={resetSimulator}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 transition-colors"
              title="Reset Baseline"
              aria-label="Reset Simulator"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Frequency Selector */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs text-slate-400 shrink-0">
            <span>Rate:</span>
            <select
              value={sampleRateHz}
              onChange={e => setSampleRate(Number(e.target.value))}
              aria-label="Telemetry Ingestion Sample Rate"
              className="bg-[#111726] dark:bg-[#111726] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none focus:border-cyan-500 font-semibold text-xs"
            >
              <option value={5}>5 Hz</option>
              <option value={10}>10 Hz</option>
              <option value={20}>20 Hz</option>
              <option value={50}>50 Hz</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};
