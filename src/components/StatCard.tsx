'use client';

import { useCountUp, useAnimateOnMount } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  delay?: number;
  positive?: boolean;
}

export default function StatCard({ title, value, previousValue, delay = 0, positive }: StatCardProps) {
  const animatedValue = useCountUp(value);
  const visible = useAnimateOnMount(delay);

  const delta = previousValue !== undefined && previousValue !== 0
    ? ((value - previousValue) / Math.abs(previousValue)) * 100
    : undefined;

  const isPositive = positive ?? (delta !== undefined ? delta >= 0 : value >= 0);

  return (
    <div
      role="status"
      aria-label={`${title}: ${formatCurrency(value)}`}
      className={`
        bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5
        transition-all duration-300 ease-out
        hover:border-[#3a3a3a] cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <p className="text-zinc-400 text-sm font-medium mb-2">{title}</p>
      <p className="text-2xl font-semibold text-white tracking-tight" aria-live="polite">
        {formatCurrency(animatedValue)}
      </p>
      {delta !== undefined && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            isPositive ? 'text-[#22c55e]' : 'text-red-400'
          }`}
          aria-label={`${delta > 0 ? 'Aumento' : delta < 0 ? 'Disminución' : 'Sin cambio'} de ${Math.abs(delta).toFixed(1)}% vs mes anterior`}
        >
          {delta > 0 ? (
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : delta < 0 ? (
            <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}% vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
