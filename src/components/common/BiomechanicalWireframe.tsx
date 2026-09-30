import React, { useState } from 'react';
import { PostureStatus } from '../../types';

interface BiomechanicalWireframeProps {
  jointAngle: number; // trunk flexion degrees (0-90)
  postureStatus: PostureStatus;
  muscleActivity: number; // % MVC
  physicalLoad: number; // kg
  className?: string;
  showDetails?: boolean;
}

export const BiomechanicalWireframe: React.FC<BiomechanicalWireframeProps> = ({
  jointAngle,
  postureStatus,
  muscleActivity,
  physicalLoad,
  className = '',
  showDetails = true,
}) => {
  const [showStressHotspots, setShowStressHotspots] = useState(true);

  // SVG coordinates calculation for skeletal avatar
  // Hip joint acts as the biomechanical pivot (L5/S1 vertebral segment)
  const hipX = 140;
  const hipY = 185;
  const spineLength = 76;

  // Convert flexion angle (deg) to radians. Forward bend is counter-clockwise in SVG
  const angleRad = (jointAngle * Math.PI) / 180;
  const trunkX = hipX - spineLength * Math.sin(angleRad);
  const trunkY = hipY - spineLength * Math.cos(angleRad);

  // Neck and Head
  const neckLength = 20;
  const headX = trunkX - neckLength * Math.sin(angleRad * 1.05);
  const headY = trunkY - neckLength * Math.cos(angleRad * 1.05);

  // Arms extending down / holding load
  const armLength = 52;
  const handX = trunkX + 22 * Math.sin(angleRad * 0.5);
  const handY = trunkY + armLength;

  // Color mapping based on ergonomic status
  let spineColor = '#10b981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.3)';
  if (postureStatus === 'high_risk') {
    spineColor = '#f43f5e'; // rose
    glowColor = 'rgba(244, 63, 94, 0.45)';
  } else if (postureStatus === 'attention') {
    spineColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.35)';
  }

  const muscleStrainColor =
    muscleActivity > 65 ? '#f43f5e' : muscleActivity > 40 ? '#f59e0b' : '#06b6d4';

  return (
    <div
      className={`relative bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col items-center select-none overflow-hidden shadow-lg transition-all duration-300 ${className}`}
    >
      {/* Precision coordinate grid background */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Header telemetry readout */}
      <div className="w-full flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200 mb-2 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="tracking-wider uppercase font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">
            Kinematic Posture Rig
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStressHotspots(!showStressHotspots)}
            className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors"
            title="Toggle stress visualization"
          >
            {showStressHotspots ? 'Hotspots: ON' : 'Hotspots: OFF'}
          </button>
          <span className="px-2 py-0.5 rounded bg-cyan-950/70 dark:bg-cyan-950/70 light:bg-cyan-100 text-cyan-400 dark:text-cyan-300 light:text-cyan-700 font-bold tabular-nums">
            θ = {jointAngle.toFixed(1)}°
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 280 270"
        className="w-full h-56 max-w-[270px] my-auto filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-10 transition-transform duration-300"
      >
        <defs>
          <radialGradient id="strainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="spineGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={spineColor} />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Floor baseline & ground reaction vector */}
        <line
          x1="25"
          y1="252"
          x2="255"
          y2="252"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <text
          x="30"
          y="264"
          fill="#64748b"
          fontSize="8.5"
          fontFamily="monospace"
        >
          GROUND_PLANE (0.0 m)
        </text>

        {/* Vertical plumb reference line (neutral 0° gravity axis) */}
        <line
          x1={hipX}
          y1="60"
          x2={hipX}
          y2={hipY}
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={hipX + 5}
          y="68"
          fill="#64748b"
          fontSize="8"
          fontFamily="monospace"
        >
          0° GRAVITY AXIS
        </text>

        {/* Dynamic Angle Arc representation */}
        {jointAngle > 2 && (
          <g>
            <path
              d={`M ${hipX} ${hipY - 45} A 45 45 0 0 0 ${
                hipX - 45 * Math.sin(angleRad)
              } ${hipY - 45 * Math.cos(angleRad)}`}
              fill="none"
              stroke={spineColor}
              strokeWidth="2"
              strokeDasharray="2 2"
            />
            <text
              x={hipX - 25}
              y={hipY - 48}
              fill={spineColor}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {Math.round(jointAngle)}°
            </text>
          </g>
        )}

        {/* Lumbar L4/L5 strain hotspot circle */}
        {showStressHotspots && (
          <g>
            <circle cx={hipX} cy={hipY} r="26" fill="url(#strainGlow)" className="animate-radar" />
            <circle cx={hipX} cy={hipY} r="6" fill={spineColor} stroke="#07090e" strokeWidth="2" />
            <text
              x={hipX + 10}
              y={hipY + 4}
              fill="#94a3b8"
              fontSize="8"
              fontFamily="monospace"
            >
              L4-L5
            </text>
          </g>
        )}

        {/* Lower body (Legs & Pelvis) */}
        {/* Left leg (Posterior) */}
        <polyline
          points={`${hipX},${hipY} ${hipX - 22},220 ${hipX - 38},252 ${hipX - 20},252`}
          fill="none"
          stroke="#64748b"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right leg (Anterior) */}
        <polyline
          points={`${hipX},${hipY} ${hipX + 16},220 ${hipX + 32},252 ${hipX + 50},252`}
          fill="none"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Knee Joint Nodes */}
        <circle cx={hipX - 22} cy="220" r="3" fill="#64748b" />
        <circle cx={hipX + 16} cy="220" r="3" fill="#475569" />

        {/* Spine / Torso Segment (Flexion Angle Responsive) */}
        <line
          x1={hipX}
          y1={hipY}
          x2={trunkX}
          y2={trunkY}
          stroke="url(#spineGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Thoracic / Shoulder pivot */}
        <circle
          cx={trunkX}
          cy={trunkY}
          r="5.5"
          fill={muscleStrainColor}
          stroke="#07090e"
          strokeWidth="2"
        />
        <text
          x={trunkX + 8}
          y={trunkY - 2}
          fill="#94a3b8"
          fontSize="7.5"
          fontFamily="monospace"
        >
          C7
        </text>

        {/* Upper limb & forearm holding payload */}
        <polyline
          points={`${trunkX},${trunkY} ${trunkX + 14},${trunkY + 26} ${handX},${handY}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* External payload indicator & gravitational force arrow */}
        {physicalLoad > 1 && (
          <g>
            <rect
              x={handX - 10}
              y={handY - 2}
              width="20"
              height="18"
              rx="3"
              fill="#0369a1"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <text
              x={handX}
              y={handY + 10}
              fill="#f0f9ff"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {Math.round(physicalLoad)}k
            </text>
            {/* Force vector arrow */}
            <line
              x1={handX}
              y1={handY + 18}
              x2={handX}
              y2={handY + 30}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <polygon
              points={`${handX - 3},${handY + 28} ${handX + 3},${handY + 28} ${handX},${handY + 34}`}
              fill="#38bdf8"
            />
          </g>
        )}

        {/* Cervical spine / Neck */}
        <line
          x1={trunkX}
          y1={trunkY}
          x2={headX}
          y2={headY}
          stroke="#94a3b8"
          strokeWidth="3"
        />

        {/* Cranial Telemetry Pod / Head */}
        <circle
          cx={headX - 5 * Math.sin(angleRad)}
          cy={headY - 5 * Math.cos(angleRad)}
          r="13"
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="2.2"
        />
        {/* Visor / Field of view orientation vector */}
        <line
          x1={headX - 9 * Math.sin(angleRad)}
          y1={headY - 5 * Math.cos(angleRad)}
          x2={headX - 18 * Math.sin(angleRad)}
          y2={headY - 3 * Math.cos(angleRad)}
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Real-time Bio-mechanical readout bar */}
      {showDetails && (
        <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-xs font-mono z-10">
          <div className="bg-[#111726]/60 dark:bg-[#111726]/60 light:bg-slate-100 p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Ergonomic Tier</span>
            <span
              className={`font-semibold tracking-wider ${
                postureStatus === 'high_risk'
                  ? 'text-rose-500 dark:text-rose-400'
                  : postureStatus === 'attention'
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-emerald-500 dark:text-emerald-400'
              }`}
            >
              {postureStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="bg-[#111726]/60 dark:bg-[#111726]/60 light:bg-slate-100 p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">EMG Recruitment</span>
            <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold tabular-nums">
              {muscleActivity.toFixed(0)}% MVC
            </span>
          </div>

          <div className="bg-[#111726]/60 dark:bg-[#111726]/60 light:bg-slate-100 p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Spinal Payload</span>
            <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold tabular-nums">
              {physicalLoad.toFixed(1)} kg
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
