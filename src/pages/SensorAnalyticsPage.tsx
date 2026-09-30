import {
  Activity,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  Compass,
  Cpu,
  FileCode,
  Flame,
  Heart,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { RiskIndicator } from '../components/common/RiskBadge';
import { useMonitoring } from '../context/MonitoringContext';
import {
  defaultAnalyticsEngine,
  runAnalyticsUnitTests,
  runScenarioBenchmarks,
  ScenarioBenchmarkResult,
} from '../services/analyticsEngine';

export const SensorAnalyticsPage: React.FC = () => {
  const { readingsBuffer, latestMetrics } = useMonitoring();
  const [activeTab, setActiveTab] = useState<'features' | 'benchmarks' | 'unittests'>('features');

  // Benchmark state
  const [benchmarks, setBenchmarks] = useState<ScenarioBenchmarkResult[]>(() => {
    return defaultAnalyticsEngine.runBenchmarkScenarios();
  });
  const [isRunningBenchmarks, setIsRunningBenchmarks] = useState(false);

  // Unit tests state
  const [unitTestReport, setUnitTestReport] = useState(() => runAnalyticsUnitTests());
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Compute statistical aggregates over current temporal window
  const count = readingsBuffer.length || 1;
  const hrSum = readingsBuffer.reduce((a, b) => a + b.heart_rate, 0);
  const avgHR = Math.round(hrSum / count);
  const peakHR = Math.max(...readingsBuffer.map(r => r.heart_rate), 70);
  const minHR = Math.min(...readingsBuffer.map(r => r.heart_rate), 70);

  const muscleSum = readingsBuffer.reduce((a, b) => a + b.muscle_activity, 0);
  const avgMuscle = (muscleSum / count).toFixed(1);
  const peakMuscle = Math.max(...readingsBuffer.map(r => r.muscle_activity), 10).toFixed(1);

  const angles = readingsBuffer.map(r => Math.abs(r.joint_angle));
  const safeCount = angles.filter(a => a <= 20).length;
  const attentionCount = angles.filter(a => a > 20 && a <= 45).length;
  const highRiskCount = angles.filter(a => a > 45).length;

  const safePct = Math.round((safeCount / count) * 100);
  const attentionPct = Math.round((attentionCount / count) * 100);
  const highRiskPct = Math.round((highRiskCount / count) * 100);

  const handleRunBenchmarks = () => {
    setIsRunningBenchmarks(true);
    setTimeout(() => {
      const results = runScenarioBenchmarks(defaultAnalyticsEngine);
      setBenchmarks(results);
      setIsRunningBenchmarks(false);
    }, 250);
  };

  const handleRunUnitTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const report = runAnalyticsUnitTests();
      setUnitTestReport(report);
      setIsRunningTests(false);
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 lg:p-6 shadow-lg transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 dark:text-cyan-400 light:text-cyan-700 uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{defaultAnalyticsEngine.modelName}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-[10px]">
                v{defaultAnalyticsEngine.modelVersion}
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mt-1 font-sans">
              Modular Biomechanical Signal Processing & Analytics
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 max-w-3xl leading-relaxed">
              10 Decoupled Pipeline Modules: Validation → Cleaning → Signal Processing → Feature Extraction → Fatigue → Movement → Posture → Physical Load → Risk Synthesis → Recommendations. Extensible via <code className="text-cyan-300 font-mono">IAnalyticsEngine</code> interface for future machine-learning models.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-400/90 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-xl">
              Non-Diagnostic Decision Support
            </span>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#111726] dark:bg-[#111726] light:bg-slate-100 p-1 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 font-mono text-xs">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'features'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Live Windowed Features
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'benchmarks'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Scenario Benchmarks (6 Scenarios)
            </button>
            <button
              onClick={() => setActiveTab('unittests')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'unittests'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Unit Tests & Edge Cases
            </button>
          </div>

          {activeTab === 'benchmarks' && (
            <button
              onClick={handleRunBenchmarks}
              disabled={isRunningBenchmarks}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/40"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunningBenchmarks ? 'animate-spin' : ''}`} />
              <span>{isRunningBenchmarks ? 'Running Scenarios...' : 'Rerun 6 Scenario Benchmarks'}</span>
            </button>
          )}

          {activeTab === 'unittests' && (
            <button
              onClick={handleRunUnitTests}
              disabled={isRunningTests}
              className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/40"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Testing...' : 'Execute Automated Test Suite'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: LIVE STATISTICAL FEATURE EXTRACTION */}
      {activeTab === 'features' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Primary Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase font-bold">Cardiovascular Strain</span>
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {avgHR} <span className="text-xs font-normal text-slate-400">avg BPM</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-100 pt-2">
                <span>Range: {minHR} - {peakHR}</span>
                <span className="text-cyan-400 font-semibold">Reserve: {latestMetrics.heartRateLoad}%</span>
              </div>
            </div>

            <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase font-bold">Mean Muscle Recruitment</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {avgMuscle} <span className="text-xs font-normal text-slate-400">% MVC</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-100 pt-2">
                <span>Peak: {peakMuscle}%</span>
                <span className="text-cyan-400 font-semibold">EMG RMS Active</span>
              </div>
            </div>

            <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase font-bold">Kinematic Acceleration</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {latestMetrics.avgAcceleration} <span className="text-xs font-normal text-slate-400">m/s²</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-100 pt-2">
                <span>Jerk Events: {latestMetrics.abnormalMovementEvents}</span>
                <span className="text-emerald-400 font-semibold">Nominal 1G Base</span>
              </div>
            </div>

            <div className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-mono text-[10px] uppercase font-bold">Repetitive Lifting Cycles</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white dark:text-white light:text-slate-900 tabular-nums">
                {latestMetrics.repetitionCount} <span className="text-xs font-normal text-slate-400">cycles</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-100 pt-2">
                <span>Fluidity: {latestMetrics.movementScore}/100</span>
                <span className="text-indigo-400 font-semibold">Kinematic Pass</span>
              </div>
            </div>
          </div>

          {/* Posture Distribution & Pipeline Documentation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
                <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider font-mono">
                  Posture Exposure Distribution (Temporal Window)
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{count} samples</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-emerald-400 font-semibold">Safe Neutral (0° - 20°)</span>
                    <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 tabular-nums font-bold">{safePct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${safePct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Spine in neutral biomechanical alignment; lowest disc compression.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-amber-400 font-semibold">Attention Required (21° - 45°)</span>
                    <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 tabular-nums font-bold">{attentionPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${attentionPct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Mild muscular torque; acceptable for brief intermittent tasks.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-rose-400 font-semibold">High Risk (&gt;45°)</span>
                    <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 tabular-nums font-bold">{highRiskPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${highRiskPct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Elevated anterior shear and lumbosacral moment arm. Sustained exposure triggers alerts.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
                <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider font-mono">
                  10-Stage Analytics Pipeline Architecture
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">Rule-Based & ML-Ready</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200">
                  <div className="text-cyan-400 font-bold text-[10px]">STAGE 1 & 2</div>
                  <div className="text-slate-200 dark:text-slate-200 light:text-slate-900 font-bold text-[11px] mt-0.5">Sensor Validation & Cleaning</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">Bounds checking, NaN rejection, duplicate filtering.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200">
                  <div className="text-cyan-400 font-bold text-[10px]">STAGE 3 & 4</div>
                  <div className="text-slate-200 dark:text-slate-200 light:text-slate-900 font-bold text-[11px] mt-0.5">Signal Processing & Features</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">Euclidean norm, dynamic gravity separation, jerk da/dt.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200">
                  <div className="text-cyan-400 font-bold text-[10px]">STAGE 5 & 6</div>
                  <div className="text-slate-200 dark:text-slate-200 light:text-slate-900 font-bold text-[11px] mt-0.5">Fatigue & Movement Models</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">Explainable 0-100 fatigue score, repetition detection.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200">
                  <div className="text-cyan-400 font-bold text-[10px]">STAGE 7, 8, 9 & 10</div>
                  <div className="text-slate-200 dark:text-slate-200 light:text-slate-900 font-bold text-[11px] mt-0.5">Posture, Load & Risk Synthesis</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">REBA-derived posture, NIOSH limits, recommendation engine.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCENARIO BENCHMARKS (6 SCENARIOS) */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-xs text-slate-300 font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Standardized Scenario Verification: 6 Multi-Sensor Workload Profiles</span>
            </div>
            <span className="text-cyan-300 font-bold">
              {benchmarks.filter(b => b.logicalAssertionsPass).length} / {benchmarks.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benchmarks.map(b => (
              <div
                key={b.scenario}
                className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[11px]">
                    <span className="text-cyan-400 font-bold uppercase">{b.scenario.replace('_', ' ')}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        b.logicalAssertionsPass
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950/70 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {b.logicalAssertionsPass ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{b.logicalAssertionsPass ? 'VERIFIED' : 'FAILED'}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 font-sans mb-1">
                    {b.scenarioName}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mb-4 leading-relaxed font-sans">
                    {b.notes}
                  </p>

                  <div className="space-y-1.5 text-xs font-mono bg-[#111726] dark:bg-[#111726] light:bg-slate-100 rounded-xl p-3 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fatigue Index:</span>
                      <span className="text-white dark:text-white light:text-slate-900 font-bold tabular-nums">
                        {b.fatigueScore}/100 ({b.fatigueLevel.toUpperCase()})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Posture Status:</span>
                      <span className="text-cyan-400 font-bold uppercase">{b.postureStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Overall Risk:</span>
                      <RiskIndicator level={b.overallRisk} size="sm" />
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
                      <span className="text-slate-500">Repetitions:</span>
                      <span className="text-indigo-400 font-bold tabular-nums">{b.finalMetrics.repetitionCount} cycles</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Input: 30 synthesized readings</span>
                  <span className="text-cyan-400">Deterministic Pass</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UNIT TESTS & EDGE CASES */}
      {activeTab === 'unittests' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-[#111726] dark:bg-[#111726] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-white dark:text-white light:text-slate-900 font-bold">
                Automated Analytics Unit Tests (Sensor Validation, Edge Cases & Mathematical Invariants)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold">
                {unitTestReport.passed} Passed
              </span>
              {unitTestReport.failed > 0 && (
                <span className="text-rose-400 font-bold">
                  {unitTestReport.failed} Failed
                </span>
              )}
              <span className="text-slate-400">Total: {unitTestReport.total} Tests</span>
            </div>
          </div>

          <div className="space-y-2">
            {unitTestReport.results.map((test, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-start justify-between gap-3 text-xs font-mono shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200">
                        {test.suite}
                      </span>
                      <span className="text-white dark:text-white light:text-slate-900 font-bold">
                        {test.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 leading-relaxed font-sans">
                      {test.message}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    test.passed
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/70 text-rose-300 border border-rose-800'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
