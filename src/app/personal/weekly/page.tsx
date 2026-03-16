'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth, getWeekOfMonth, getCurrentMonth, getCurrentYear, getFullMonthName } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyFlowPage() {
  const store = useStore();

  const weeklyData = useMemo(() => {
    const weeks: Record<number, { amount: number; count: number }> = {};
    for (let i = 1; i <= 5; i++) weeks[i] = { amount: 0, count: 0 };

    store.personalExpenses
      .filter(e => isCurrentMonth(e.date))
      .forEach(e => {
        const w = getWeekOfMonth(e.date);
        if (weeks[w]) {
          weeks[w].amount += e.amount;
          weeks[w].count += 1;
        }
      });

    return Object.entries(weeks).map(([week, data]) => ({
      name: `Semana ${week}`,
      amount: data.amount,
      count: data.count,
    }));
  }, [store.personalExpenses]);

  const totalMonth = weeklyData.reduce((s, w) => s + w.amount, 0);
  const avgWeek = totalMonth / Math.max(weeklyData.filter(w => w.amount > 0).length, 1);
  const hasData = weeklyData.some(w => w.amount > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-400 text-sm">
          {getFullMonthName(getCurrentMonth())} {getCurrentYear()} — Desglose semanal de gastos
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin gastos esta semana"
          description="Agrega gastos en la sección de gastos para ver el desglose semanal"
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-zinc-400 text-sm mb-1">Total del mes</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(totalMonth)}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-zinc-400 text-sm mb-1">Promedio semanal</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(avgWeek)}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-zinc-400 text-sm mb-1">Transacciones</p>
              <p className="text-xl font-semibold text-white">{weeklyData.reduce((s, w) => s + w.count, 0)}</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-8">
            <h3 className="text-white font-medium mb-4">Gasto por semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#3f3f46" />
                <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '0.75rem' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} animationDuration={800} name="Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Week Details */}
          <div className="space-y-3">
            {weeklyData.map(week => {
              const pctOfTotal = totalMonth > 0 ? (week.amount / totalMonth) * 100 : 0;
              const isHigh = pctOfTotal > 30;
              return (
                <div key={week.name} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{week.name}</span>
                    <span className="text-zinc-500 text-sm">{week.count} transacciones</span>
                    {isHigh && week.amount > 0 && (
                      <span className="text-yellow-500 text-xs font-medium">Alto gasto</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-semibold">{formatCurrency(week.amount)}</span>
                    <span className="text-zinc-600 text-xs">{pctOfTotal.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
