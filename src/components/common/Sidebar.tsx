import {
  Activity,
  AlertTriangle,
  Award,
  BatteryCharging,
  Clock,
  Compass,
  Cpu,
  FileCode,
  FileText,
  Flame,
  Gauge,
  Radio,
  Sliders,
  User,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useMonitoring } from '../../context/MonitoringContext';
import { NavItem } from '../../types';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  items: { id: NavItem; label: string; icon: React.ElementType; badge?: number }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { unreadAlertsCount, selectedDevice, latestReading, isSessionActive } = useMonitoring();

  const sections: NavSection[] = [
    {
      title: 'Judges Evaluation',
      items: [
        { id: 'competition-demo', label: 'Competition Demo', icon: Award },
      ],
    },
    {
      title: 'Real-Time Telemetry',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Gauge },
        { id: 'live-monitoring', label: 'Live Stream', icon: Radio },
        { id: 'analytics', label: 'Sensor Analytics', icon: Activity },
      ],
    },
    {
      title: 'Ergonomics & Risk',
      items: [
        { id: 'fatigue', label: 'Fatigue Model', icon: Flame },
        { id: 'movement', label: 'Posture & REBA', icon: Compass },
        { id: 'alerts', label: 'Safety Alerts', icon: AlertTriangle, badge: unreadAlertsCount },
      ],
    },
    {
      title: 'Audit & Records',
      items: [
        { id: 'sessions', label: 'Shift Sessions', icon: Clock },
        { id: 'reports', label: 'Compliance Reports', icon: FileText },
      ],
    },
    {
      title: 'Hardware & System',
      items: [
        { id: 'devices', label: 'ESP32 Hardware', icon: Cpu },
        { id: 'hardware-guide', label: 'Hardware Guide', icon: FileCode },
        { id: 'profile', label: 'Worker Profile', icon: User },
        { id: 'settings', label: 'System Settings', icon: Sliders },
      ],
    },
  ];

  const handleSelect = (tab: NavItem) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Primary Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#090d16] dark:bg-[#090d16] light:bg-slate-50 border-r border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 p-4 flex flex-col justify-between transition-transform duration-250 z-40 shadow-2xl lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-mono tracking-widest uppercase text-slate-500 font-bold">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 dark:text-cyan-300 light:text-cyan-800 border border-cyan-500/30 shadow-[0_0_12px_-3px_rgba(6,182,212,0.25)]'
                          : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-200/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-cyan-400'
                              : 'text-slate-400 dark:text-slate-400 light:text-slate-500'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Wearable Pod Telemetry Micro-Panel in Footer */}
        <div className="pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 mt-2">
          <div className="bg-[#0f1424] dark:bg-[#0f1424] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-xl p-3 text-xs shadow-sm">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>IOT SENSOR POD</span>
              </span>
              <span className="text-cyan-400 font-bold">#26113</span>
            </div>

            <div className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 truncate text-[11px]">
              {selectedDevice?.deviceName || 'Wearable Rig'}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mt-2">
              <div className="flex items-center gap-1 text-emerald-400">
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>{selectedDevice?.batteryLevel ?? 94}%</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-400">
                <Radio className="w-3 h-3" />
                <span>{selectedDevice?.sampleRateHz ?? 10} Hz</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Live Pulse:</span>
              <span className="text-rose-400 font-bold tabular-nums">
                {latestReading.heart_rate} BPM
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Visible only on small screens < 1024px) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#07090e]/95 dark:bg-[#07090e]/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800 dark:border-slate-800 light:border-slate-200 z-30 px-2 flex items-center justify-around"
      >
        {[
          { id: 'dashboard', label: 'Dash', icon: Gauge },
          { id: 'live-monitoring', label: 'Live', icon: Radio },
          { id: 'fatigue', label: 'Fatigue', icon: Flame },
          { id: 'movement', label: 'Posture', icon: Compass },
          { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: unreadAlertsCount },
        ].map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavItem)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg relative min-w-[56px] transition-colors ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 dark:text-slate-400 light:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
