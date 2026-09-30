import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCheck,
  Filter,
  Info,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';

export const AlertsPage: React.FC = () => {
  const { alerts, markAlertRead, clearAlerts } = useMonitoring();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
            Risk & Safety Notification Engine
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Ergonomic Threshold Alerts & Incident Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time event detection for posture violations, excessive cardiovascular loads, and fatigue ceiling triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alerts.forEach(a => markAlertRead(a.id))}
            className="px-3 py-1.5 bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mark All Acknowledged</span>
          </button>
          <button
            onClick={clearAlerts}
            className="px-3 py-1.5 bg-[#111726] hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0b0f19] border border-slate-800 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
          <Filter className="w-3.5 h-3.5" />
          <span>Severity:</span>
        </div>
        <div className="flex items-center gap-1 bg-[#111726] p-1 rounded-lg border border-slate-800">
          {['all', 'critical', 'warning', 'info'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors uppercase font-mono ${
                filterSeverity === sev
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-mono ml-auto">
          <span>Category:</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-[#111726] border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="Posture">Posture</option>
            <option value="Fatigue">Fatigue</option>
            <option value="Physical Load">Physical Load</option>
            <option value="Movement">Movement</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-12 text-center">
            <CheckCircle2Icon className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <div className="text-sm font-semibold text-white">No Alerts Found</div>
            <div className="text-xs text-slate-400 mt-1">
              All sensor channels and ergonomic thresholds within nominal boundaries.
            </div>
          </div>
        ) : (
          filtered.map(alert => (
            <div
              key={alert.id}
              className={`bg-[#0b0f19] border rounded-xl p-4 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                !alert.isRead
                  ? 'border-slate-700 bg-[#0c1220]'
                  : 'border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {alert.severity === 'critical' ? (
                    <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : alert.severity === 'warning' ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">{alert.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                        alert.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : alert.severity === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {alert.category}
                    </span>
                    {!alert.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="mt-2 text-[11px] text-cyan-300 font-mono bg-[#111726] px-2.5 py-1 rounded inline-block">
                    <span className="text-slate-400">Action:</span> {alert.recommendedAction}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                {!alert.isRead ? (
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-xs font-mono transition-colors"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">Acknowledged</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
