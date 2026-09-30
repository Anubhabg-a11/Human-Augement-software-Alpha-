import {
  Activity,
  Award,
  BatteryCharging,
  Bell,
  Clock,
  FileCode,
  LogOut,
  Menu,
  Moon,
  Radio,
  Sliders,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMonitoring } from '../../context/MonitoringContext';
import { useTheme } from '../../context/ThemeContext';
import { NavItem } from '../../types';

interface HeaderProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, isAuthenticated, logout, loginDemo } = useAuth();
  const { selectedDevice, unreadAlertsCount, resetToDemo, isSessionActive, activeSession } = useMonitoring();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#07090e]/95 dark:bg-[#07090e]/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-4 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Mobile toggle & Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 font-sans flex items-center gap-1.5">
                <span>HumanAugment</span>
                <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-cyan-100 border border-cyan-800/60">
                  AI
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-400 light:text-slate-500 hidden sm:block">
                Hardware ID 26113 · Ergonomics Telemetry
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-600">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'live-monitoring', label: 'Live Stream' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'fatigue', label: 'Fatigue' },
            { id: 'movement', label: 'Posture' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'reports', label: 'Reports' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavItem)}
              className={`transition-colors hover:text-cyan-400 relative py-1 ${
                currentTab === item.id
                  ? 'text-cyan-400 dark:text-cyan-400 light:text-cyan-600 font-bold'
                  : ''
              }`}
            >
              {item.label}
              {currentTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions, Device Pill, Theme Toggle, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Active Recording Pill */}
          {isSessionActive && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800/80 text-rose-300 font-mono text-xs shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>RECORDING SHIFT</span>
            </div>
          )}

          {/* Active Hardware Device Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d121f] dark:bg-[#0d121f] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                selectedDevice?.status === 'SIMULATED'
                  ? 'bg-cyan-400 animate-pulse'
                  : selectedDevice?.status === 'ONLINE'
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold truncate max-w-[130px]">
              {selectedDevice?.deviceName || 'Wearable Rig'}
            </span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-0.5 ml-1">
              <BatteryCharging className="w-3.5 h-3.5" />
              {selectedDevice?.batteryLevel ?? 94}%
            </span>
          </div>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Clinical Mode' : 'Switch to Dark Scientific Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => onSelectTab('alerts')}
            className="relative p-2 rounded-xl text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors"
            title="Active Safety Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Competition Demo Mode Launcher */}
          <button
            onClick={() => onSelectTab('competition-demo')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all shadow-sm ${
              currentTab === 'competition-demo'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/50'
                : 'bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300'
            }`}
            title="Launch Competition Demo Mode for Judges"
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Demo Mode</span>
          </button>

          {/* Demo Reset Quick Button */}
          <button
            onClick={resetToDemo}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white bg-[#0e1424] dark:bg-[#0e1424] light:bg-slate-100 hover:bg-slate-800 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 rounded-xl transition-all"
            title="Reset platform to demo state"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Demo</span>
          </button>

          {/* Operator Profile Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors text-left"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-500/50 text-cyan-300 dark:text-cyan-300 light:text-cyan-800 font-mono text-xs flex items-center justify-center font-bold">
                  {user?.fullName?.charAt(0) || 'O'}
                </div>
                <div className="hidden sm:block text-xs leading-tight">
                  <div className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 truncate max-w-[120px]">
                    {user?.fullName || 'Operator'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                    {user?.department?.split(' ')[0] || 'Ergonomics'}
                  </div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0d121f] dark:bg-[#0d121f] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
                    <p className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                      {user?.role}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Worker Profile & Baselines</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('hardware-guide');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hardware Integration Guide</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>System Settings & Limits</span>
                  </button>

                  <div className="border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => loginDemo()}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/40"
            >
              Demo Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
