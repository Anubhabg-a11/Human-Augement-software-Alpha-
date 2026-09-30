import {
  Building,
  Check,
  Heart,
  Mail,
  Save,
  Shield,
  Sliders,
  User,
  Weight,
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [role, setRole] = useState(user?.role || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [restingHR, setRestingHR] = useState(user?.restingHeartRate || 65);
  const [maxHR, setMaxHR] = useState(user?.maxHeartRate || 185);
  const [weightKg, setWeightKg] = useState(user?.weightKg || 75);
  const [maxLoadKg, setMaxLoadKg] = useState(user?.maxLoadPermissibleKg || 25);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      role,
      department,
      restingHeartRate: Number(restingHR),
      maxHeartRate: Number(maxHR),
      weightKg: Number(weightKg),
      maxLoadPermissibleKg: Number(maxLoadKg),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 lg:p-5">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
          Worker Configuration
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Operator Biomechanical Profile & Baselines
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Personalized cardiovascular boundaries, ergonomic load limits, and shift departmental parameters used by the analytics engine.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Operator Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#111726] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-[#0d121d] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-400 font-mono opacity-80"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5">Organizational Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5">Department / Work Cell</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-[#111726] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Biomechanical Calibration Baselines */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono pb-2 border-b border-slate-800">
            Physiological & Ergonomic Baselines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1.5">Resting HR (BPM)</label>
              <input
                type="number"
                value={restingHR}
                onChange={e => setRestingHR(Number(e.target.value))}
                min={40}
                max={100}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Baseline at rest</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5">Max HR (BPM)</label>
              <input
                type="number"
                value={maxHR}
                onChange={e => setMaxHR(Number(e.target.value))}
                min={140}
                max={220}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Age-adjusted max</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5">Body Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
                min={40}
                max={160}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Static mass reference</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5">Permissible Lift (kg)</label>
              <input
                type="number"
                value={maxLoadKg}
                onChange={e => setMaxLoadKg(Number(e.target.value))}
                min={5}
                max={50}
                className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Threshold trigger limit</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-3">
          {savedSuccess && (
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Profile baselines updated successfully</span>
            </div>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Baselines</span>
          </button>
        </div>
      </form>
    </div>
  );
};
