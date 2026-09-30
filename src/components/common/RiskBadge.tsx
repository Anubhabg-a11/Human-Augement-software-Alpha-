import React from 'react';
import { FatigueLevel, PostureStatus, RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | FatigueLevel | PostureStatus | string;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  label,
  size = 'md',
  showPulse = true,
}) => {
  const normalized = String(level).toLowerCase();

  let colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  let dotClass = 'bg-emerald-500 ring-2 ring-emerald-500/20';
  let displayLabel = label || normalized.replace('_', ' ').toUpperCase();

  if (normalized === 'high' || normalized === 'high_risk' || normalized === 'critical') {
    colorClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-[0_0_12px_-2px_rgba(244,63,94,0.3)]';
    dotClass = 'bg-rose-500 ring-2 ring-rose-500/30 animate-pulse';
  } else if (
    normalized === 'moderate' ||
    normalized === 'attention' ||
    normalized === 'mild' ||
    normalized === 'warning'
  ) {
    colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[0_0_12px_-2px_rgba(245,158,11,0.2)]';
    dotClass = 'bg-amber-500 ring-2 ring-amber-500/20';
  } else {
    colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    dotClass = 'bg-emerald-500 ring-2 ring-emerald-500/20';
  }

  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[10px]'
      : size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wider transition-all duration-200 ${sizeClasses} ${colorClasses}`}
    >
      {showPulse && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
};

export const RiskIndicator = RiskBadge;
