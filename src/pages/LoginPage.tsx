import { Activity, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoToRegister, onBackToHome }) => {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('ergonomics.lead@humanaugment.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    await loginDemo();
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-900/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl p-8 relative z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
          <button onClick={onBackToHome} className="flex items-center gap-2 text-left">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base">HumanAugment AI</span>
          </button>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Telemetry Gateway</span>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Operator Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access industrial telemetry, fatigue scoring, and worker risk analytics.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#111726] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="operator@plant.industrial"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Access Passcode</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#111726] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Telemetry'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-[#0b0f19] px-2 text-[10px] uppercase font-mono text-slate-500">
            or instant evaluation
          </span>
        </div>

        {/* Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-[#111726] hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Demo Sign In (Ergonomics Lead)</span>
        </button>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>New workstation or device operator? </span>
          <button
            onClick={onGoToRegister}
            className="text-cyan-400 hover:underline font-medium"
          >
            Register account
          </button>
        </div>
      </div>
    </div>
  );
};
