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
      className={`
        bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5
        transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <p className="text-zinc-400 text-sm font-medium mb-2">{title}</p>
      <p className="text-2xl font-semibold text-white tracking-tight">
        {formatCurrency(animatedValue)}
      </p>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          isPositive ? 'text-[#22c55e]' : 'text-red-400'
        }`}>
          {delta > 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : delta < 0 ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
          <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}% vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
