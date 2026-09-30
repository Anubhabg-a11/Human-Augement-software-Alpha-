import {
  Activity,
  ArrowRight,
  Award,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  FileText,
  Flame,
  Gauge,
  Radio,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NavItem } from '../types';

interface LandingPageProps {
  onExplore: () => void;
  onGoToAuth: (mode: 'login' | 'register') => void;
  onLaunchCompetitionDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore, onGoToAuth, onLaunchCompetitionDemo }) => {
  const { loginDemo } = useAuth();

  const handleLaunchDemo = async () => {
    await loginDemo();
    onExplore();
  };

  const handleCompetitionDemo = async () => {
    await loginDemo();
    if (onLaunchCompetitionDemo) {
      onLaunchCompetitionDemo();
    } else {
      onExplore();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              HumanAugment <span className="text-cyan-400">AI</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#how-it-works" className="hover:text-slate-100 transition-colors">How It Works</a>
            <a href="#technology" className="hover:text-slate-100 transition-colors">Technology</a>
            <a href="#features" className="hover:text-slate-100 transition-colors">Ergonomics & Safety</a>
            <a href="#hardware-ready" className="hover:text-slate-100 transition-colors">Hardware Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCompetitionDemo}
              className="px-3.5 py-1.5 text-xs font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/70 text-cyan-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Mode</span>
            </button>
            <button
              onClick={() => onGoToAuth('login')}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={handleLaunchDemo}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        {/* Subtle radial lighting mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-900/20 via-blue-900/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="text-xs font-mono tracking-widest text-cyan-400 uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Hardware Statement ID 26113 · Ergonomic Telemetry</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 text-balance">
              Understand Human Performance. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
                Monitor. Analyze. Improve.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
              An intelligent human augmentation monitoring platform designed to transform wearable sensor data into meaningful performance and risk insights. Engineered for industrial ergonomics, worker safety, and human biomechanical decision support.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={handleLaunchDemo}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center gap-2 shadow-xl shadow-cyan-950/50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Live Demo Mode</span>
              </button>
              <button
                onClick={() => onGoToAuth('register')}
                className="px-6 py-3 text-sm font-medium text-slate-200 bg-[#0e1424] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
              >
                Register Account
              </button>
            </div>

            {/* Metric proof line */}
            <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold text-sm">8 Channels</span>
                <span>Biomechanical Telemetry</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold text-sm">REBA/RULA</span>
                <span>Posture Scoring</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold text-sm">ESP32 Ready</span>
                <span>REST Ingestion</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0b0f19]">
              <img
                src="/src/assets/images/augment_wearable_hero_1790620110489.jpg"
                alt="Human Augmentation Wearable Sensor Device"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-[#0a0e17]/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Wearable Telemetry Active</div>
                  <div className="text-white font-semibold text-xs">ExoSleeve IMU + EMG Module</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">10 Hz STREAM</div>
                  <div className="text-slate-400 text-[10px]">0.02s Latency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0a0e17] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">01. End-to-End Pipeline</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              From Raw Wearable Telemetry to Real-Time Decision Support
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              The platform bridges high-frequency sensor readings into actionable risk indicators without diagnosing medical conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 font-mono font-bold">
                1
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Sensor Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous capture of 3-axis Accelerometer, 3-axis Gyroscope, Heart Rate, EMG Muscle Activity, Joint Angle, and Pressure.
              </p>
            </div>

            <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 mb-4 font-mono font-bold">
                2
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Windowed Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Data cleaning, normalization, rolling mean calculation, kinematic jerk detection, and frequency-domain movement extraction.
              </p>
            </div>

            <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400 mb-4 font-mono font-bold">
                3
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Risk Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic synthesis of Estimated Fatigue (0-100), REBA-derived Posture Status, Movement Quality, and Overall Risk.
              </p>
            </div>

            <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-4 font-mono font-bold">
                4
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Intervention & Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant threshold alerts, ergonomic rotation recommendations, and downloadable shift compliance audit reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Industrial Ergonomics Showcase */}
      <section id="technology" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">02. Industrial Applications</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Built for Logistics Centers, Heavy Assembly, and Assistive Living
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Industrial manual handling is responsible for a significant percentage of musculoskeletal strain injuries. HumanAugment AI equips safety managers and operators with transparent telemetry to identify hazardous spinal flexion and cumulative muscular fatigue before injuries occur.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Posture Risk Categorization:</span> Distinguishes Safe (0-20°), Attention Required (21-45°), and High Risk (&gt;45°) joint angles.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Cardiovascular Reserve Monitoring:</span> Computes Karvonen heart rate load relative to worker baseline profiles.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Repetition & Jerk Detection:</span> Automatically increments cycle counts and catches sudden deceleration slips.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src="/src/assets/images/industrial_ergonomics_worker_1790620127684.jpg"
                alt="Industrial worker with ergonomics sensor telemetry"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Ready Section */}
      <section id="hardware-ready" className="py-20 px-6 bg-[#0a0e17] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src="/src/assets/images/biomechanical_sensor_module_1790620145171.jpg"
                alt="Biomechanical micro-sensor hardware module"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover object-center"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">03. Hardware Ingestion Ready</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Ready for Future ESP32 / IoT Hardware Integration
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              While the physical sensor module is under active hardware development, the software architecture features production-ready REST ingestion endpoints (<code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">POST /api/sensor-data</code>). Wearable firmware can begin broadcasting immediately over WiFi or BLE gateways.
            </p>

            <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
              <div className="text-[10px] text-slate-500 uppercase mb-2">ESP32 Hardware Ingestion Schema</div>
              <pre className="text-cyan-300 text-[11px] overflow-x-auto leading-relaxed">
{`{
  "deviceId": "ESP32-BIO-01",
  "timestamp": 1727546000000,
  "sequenceNumber": 1042,
  "accelerometer": { "x": 0.12, "y": 1.45, "z": 9.81 },
  "gyroscope": { "x": 12.4, "y": 8.1, "z": 3.2 },
  "heartRate": 88,
  "muscleActivity": 34.5,
  "jointAngle": 18.2,
  "pressure": 6.4,
  "temperature": 36.7
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-6 border-t border-slate-800/80 bg-gradient-to-b from-[#0a0e17] to-[#07090e] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Test the Monitoring Platform in Realistic Simulation Mode
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Experience real-time waveform oscilloscopes, 2D biomechanical skeletal avatar analysis, fatigue scoring, and automatic alert generation without waiting for physical prototypes.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={handleCompetitionDemo}
              className="px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg transition-colors flex items-center gap-2 shadow-xl shadow-cyan-950/60"
            >
              <Award className="w-4 h-4" />
              <span>Launch Competition Demo Mode</span>
            </button>
            <button
              onClick={handleLaunchDemo}
              className="px-6 py-3 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGoToAuth('login')}
              className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800/60 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            HumanAugment AI · Problem Statement ID 26113 · Industrial Ergonomics Decision Support
          </div>
          <div>
            Biomechanical Monitoring & Telemetry Platform · Version 2.4.0
          </div>
        </div>
      </footer>
    </div>
  );
};
