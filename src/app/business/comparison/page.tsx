'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth, isLastMonth, getFullMonthName, getCurrentMonth, getCurrentYear } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus, BarChart3 } from 'lucide-react';

export default function ComparisonPage() {
  const store = useStore();

  const data = useMemo(() => {
    const currentRevenue = store.businessRevenue
      .filter(r => isCurrentMonth(r.date))
      .reduce((s, r) => s + r.amount, 0);
    const currentExpenses = store.businessExpenses
      .filter(e => isCurrentMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);
    const currentSalary = store.ownerSalaries
      .filter(s => { const now = new Date(); return s.month === now.getMonth() && s.year === now.getFullYear(); })
      .reduce((s, o) => s + o.amount, 0);
    const currentTotalExpenses = currentExpenses + currentSalary;
    const currentProfit = currentRevenue - currentTotalExpenses;
    const currentMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;

    const prevRevenue = store.businessRevenue
      .filter(r => isLastMonth(r.date))
      .reduce((s, r) => s + r.amount, 0);
    const prevExpenses = store.businessExpenses
      .filter(e => isLastMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);
    const prevMonth = getCurrentMonth() === 0 ? 11 : getCurrentMonth() - 1;
    const prevYear = getCurrentMonth() === 0 ? getCurrentYear() - 1 : getCurrentYear();
    const prevSalary = store.ownerSalaries
      .filter(s => s.month === prevMonth && s.year === prevYear)
      .reduce((s, o) => s + o.amount, 0);
    const prevTotalExpenses = prevExpenses + prevSalary;
    const prevProfit = prevRevenue - prevTotalExpenses;
    const prevMargin = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;

    return {
      current: { revenue: currentRevenue, expenses: currentTotalExpenses, profit: currentProfit, margin: currentMargin },
      previous: { revenue: prevRevenue, expenses: prevTotalExpenses, profit: prevProfit, margin: prevMargin },
    };
  }, [store.businessRevenue, store.businessExpenses, store.ownerSalaries]);

  const prevMonthIdx = getCurrentMonth() === 0 ? 11 : getCurrentMonth() - 1;

  const metrics = [
    { label: 'Ingresos', current: data.current.revenue, previous: data.previous.revenue, isCurrency: true },
    { label: 'Gastos', current: data.current.expenses, previous: data.previous.expenses, isCurrency: true, invertColor: true },
    { label: 'Utilidad', current: data.current.profit, previous: data.previous.profit, isCurrency: true },
    { label: 'Margen %', current: data.current.margin, previous: data.previous.margin, isCurrency: false, suffix: '%' },
  ];

  const hasData = data.current.revenue > 0 || data.previous.revenue > 0;

  return (
    <div>
      <p className="text-zinc-400 text-sm mb-6">Comparación mes actual vs mes anterior</p>

      {!hasData ? (
        <EmptyState icon={BarChart3} title="Sin datos para comparar" description="Necesitas datos de al menos dos meses para ver la comparación" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
              <span className="text-zinc-400 text-sm">{getFullMonthName(getCurrentMonth())} {getCurrentYear()}</span>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center">
              <span className="text-zinc-400 text-sm">{getFullMonthName(prevMonthIdx)} {getCurrentMonth() === 0 ? getCurrentYear() - 1 : getCurrentYear()}</span>
            </div>
          </div>

          <div className="space-y-4">
            {metrics.map(metric => {
              const delta = metric.previous !== 0
                ? ((metric.current - metric.previous) / Math.abs(metric.previous)) * 100
                : metric.current > 0 ? 100 : 0;
              const isPositive = metric.invertColor ? delta <= 0 : delta >= 0;

              return (
                <div key={metric.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-zinc-400 text-sm font-medium">{metric.label}</span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-[#22c55e]' : 'text-red-400'}`}>
                      {delta > 0 ? <ArrowUpRight className="w-4 h-4" aria-hidden="true" /> : delta < 0 ? <ArrowDownRight className="w-4 h-4" aria-hidden="true" /> : <Minus className="w-4 h-4" aria-hidden="true" />}
                      <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-white">
                        {metric.isCurrency ? formatCurrency(metric.current) : `${metric.current.toFixed(1)}${metric.suffix || ''}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-zinc-500">
                        {metric.isCurrency ? formatCurrency(metric.previous) : `${metric.previous.toFixed(1)}${metric.suffix || ''}`}
                      </p>
                    </div>
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
