import React, { useEffect, useRef, useState } from 'react';
import { SensorReading } from '../../types';

export interface WaveformChannel {
  key: keyof SensorReading;
  name: string;
  color: string;
  unit: string;
  min: number;
  max: number;
}

interface WaveformChartProps {
  data: SensorReading[];
  title: string;
  channels: WaveformChannel[];
  height?: number;
  showChannelToggles?: boolean;
  timeRangeOptions?: number[]; // e.g. [15, 30, 60]
}

export const WaveformChart: React.FC<WaveformChartProps> = ({
  data,
  title,
  channels,
  height = 175,
  showChannelToggles = true,
  timeRangeOptions = [15, 30, 60],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeChannels, setActiveChannels] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {};
    channels.forEach(c => {
      initial[c.key as string] = true;
    });
    return initial;
  });

  const [windowPoints, setWindowPoints] = useState<number>(30);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const toggleChannel = (key: string) => {
    setActiveChannels(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Slice data based on selected temporal window
  const visibleData = data.slice(-windowPoints);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Detect if dark or light mode
    const isDark = document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light');

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate grid lines
    ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.28)' : 'rgba(226, 232, 240, 0.9)';
    ctx.lineWidth = 1;

    // Horizontal Y Grid (4 steps)
    const gridYSteps = 4;
    for (let i = 1; i < gridYSteps; i++) {
      const y = (height / gridYSteps) * i;
      ctx.beginPath();
      ctx.moveTo(42, y);
      ctx.lineTo(width - 8, y);
      ctx.stroke();
    }

    // Vertical X Grid (5 steps)
    const gridXSteps = 5;
    for (let i = 1; i < gridXSteps; i++) {
      const x = 42 + ((width - 50) / gridXSteps) * i;
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
    }

    // Y-Axis numeric scale text on left gutter
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    // Use primary channel scale for Y-axis markings
    const primaryChan = channels[0];
    if (primaryChan) {
      const range = primaryChan.max - primaryChan.min;
      for (let i = 0; i <= gridYSteps; i++) {
        const val = Math.round(primaryChan.max - (range / gridYSteps) * i);
        const yPos = 14 + ((height - 34) / gridYSteps) * i;
        ctx.fillText(String(val), 36, yPos);
      }
    }

    // X-Axis time gutter
    ctx.textAlign = 'center';
    ctx.fillText(`-${windowPoints / 5}s`, 50, height - 6);
    ctx.fillText('Live (0s)', width - 20, height - 6);

    if (visibleData.length < 2) {
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ACQUIRING TELEMETRY SYNC...', width / 2, height / 2);
      return;
    }

    const plotWidth = width - 52;
    const plotHeight = height - 32;
    const plotLeft = 44;
    const plotTop = 10;

    // Render enabled channels
    channels.forEach(chan => {
      if (!activeChannels[chan.key as string]) return;

      const xStep = plotWidth / (visibleData.length - 1);
      const range = chan.max - chan.min || 1;

      // Draw subtle glow shadow
      ctx.shadowColor = chan.color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.strokeStyle = chan.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      visibleData.forEach((item, index) => {
        const val = Number(item[chan.key]) || 0;
        const normalized = Math.max(0, Math.min(1, (val - chan.min) / range));
        const y = plotTop + plotHeight - normalized * plotHeight;
        const x = plotLeft + index * xStep;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw hover scrubber crosshair if active
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < visibleData.length) {
      const xStep = plotWidth / (visibleData.length - 1);
      const hoverX = plotLeft + hoverIndex * xStep;

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hoverX, plotTop);
      ctx.lineTo(hoverX, plotTop + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [visibleData, channels, activeChannels, height, windowPoints, hoverIndex]);

  // Handle canvas mouse move for interactive tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || visibleData.length < 2) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const plotWidth = canvas.clientWidth - 52;
    const plotLeft = 44;

    if (clientX >= plotLeft && clientX <= plotLeft + plotWidth) {
      const relativeX = clientX - plotLeft;
      const index = Math.round((relativeX / plotWidth) * (visibleData.length - 1));
      const clampedIndex = Math.max(0, Math.min(visibleData.length - 1, index));
      setHoverIndex(clampedIndex);
      setHoverPos({ x: e.clientX - rect.left, y: clientY });
    } else {
      setHoverIndex(null);
      setHoverPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverPos(null);
  };

  const latestReading = visibleData.length > 0 ? visibleData[visibleData.length - 1] : null;
  const hoveredReading = hoverIndex !== null && visibleData[hoverIndex] ? visibleData[hoverIndex] : latestReading;

  return (
    <div
      ref={containerRef}
      className="bg-[#0d121f] dark:bg-[#0b0f19] light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 flex flex-col shadow-lg transition-all duration-300"
    >
      {/* Top Header: Title, Time Range Selector, Live Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800/70 dark:border-slate-800/70 light:border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-wide font-sans">
            {title}
          </span>
          <span className="text-[10px] font-mono text-cyan-400 dark:text-cyan-300 light:text-cyan-700 bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-cyan-100 px-2 py-0.5 rounded">
            LIVE OSCILLOSCOPE
          </span>
        </div>

        {/* Temporal Window Controls (15 pts / 30 pts / 60 pts) */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Window:</span>
          <div className="flex items-center bg-[#111726] dark:bg-[#111726] light:bg-slate-100 p-0.5 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-300">
            {timeRangeOptions.map(pts => (
              <button
                key={pts}
                onClick={() => setWindowPoints(pts)}
                className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded transition-colors ${
                  windowPoints === pts
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {pts}p
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Toggles & Telemetry Readouts */}
      <div className="flex flex-wrap items-center gap-3.5 mb-2.5">
        {channels.map(chan => {
          const isActive = activeChannels[chan.key as string];
          const val = hoveredReading ? Number(hoveredReading[chan.key]).toFixed(1) : '--';
          return (
            <button
              key={chan.key as string}
              onClick={() => showChannelToggles && toggleChannel(chan.key as string)}
              className={`flex items-center gap-2 text-xs font-mono transition-all duration-200 px-2 py-1 rounded-md border ${
                isActive
                  ? 'bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 border-slate-700/60 opacity-100'
                  : 'bg-transparent border-transparent opacity-35 line-through'
              }`}
              title={`Toggle ${chan.name}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                style={{ backgroundColor: chan.color }}
              />
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[11px] font-sans">
                {chan.name}:
              </span>
              <span className="text-slate-100 dark:text-slate-100 light:text-slate-900 font-bold tabular-nums text-[11px]">
                {val}
                <span className="text-slate-500 text-[9px] ml-1">{chan.unit}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Canvas container with hover tooltip */}
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-800/70 dark:border-slate-800/70 light:border-slate-200 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50">
        <canvas
          ref={canvasRef}
          style={{ height: `${height}px`, width: '100%' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        />

        {/* Hover Readout Overlay Badge */}
        {hoverIndex !== null && hoverPos && hoveredReading && (
          <div
            className="absolute top-2 right-2 bg-[#07090e]/90 dark:bg-[#07090e]/90 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-lg px-2.5 py-1.5 text-[10px] font-mono shadow-xl pointer-events-none z-20 backdrop-blur-md"
          >
            <div className="text-cyan-400 font-bold mb-0.5">
              T - {((visibleData.length - 1 - hoverIndex) / 5).toFixed(1)}s
            </div>
            {channels.map(c => (
              <div key={c.key as string} className="flex items-center justify-between gap-2 text-slate-300">
                <span style={{ color: c.color }}>{c.name}:</span>
                <span className="font-bold tabular-nums text-white dark:text-white light:text-slate-900">
                  {Number(hoveredReading[c.key]).toFixed(1)} {c.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
