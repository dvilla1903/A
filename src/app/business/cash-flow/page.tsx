'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import EmptyState from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function CashFlowPage() {
  const store = useStore();

  const forecast = useMemo(() => {
    const now = new Date();
    const weeks: { name: string; projected: number }[] = [];

    // Calculate monthly recurring expenses
    const recurringExpenses = store.businessExpenses
      .filter(e => e.isRecurring)
      .reduce((s, e) => s + e.amount, 0);

    // Pending receivables expected
    const pendingReceivables = store.accountsReceivable
      .filter(ar => ar.status !== 'paid')
      .reduce((s, ar) => s + (ar.totalAmount - ar.amountPaid), 0);

    // Current balance (this month's revenue - expenses)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentRevenue = store.businessRevenue
      .filter(r => { const d = new Date(r.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
      .reduce((s, r) => s + r.amount, 0);
    const currentExpenses = store.businessExpenses
      .filter(e => { const d = new Date(e.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
      .reduce((s, e) => s + e.amount, 0);
    const ownerSalary = store.ownerSalaries
      .find(s => s.month === currentMonth && s.year === currentYear)?.amount || 0;

    let balance = currentRevenue - currentExpenses - ownerSalary;

    for (let w = 1; w <= 4; w++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + (w - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Expected income from receivables due this week
      const weekReceivables = store.accountsReceivable
        .filter(ar => {
          if (ar.status === 'paid') return false;
          const due = new Date(ar.dueDate);
          return due >= weekStart && due <= weekEnd;
        })
        .reduce((s, ar) => s + (ar.totalAmount - ar.amountPaid), 0);

      // Weekly recurring expense portion
      const weeklyRecurring = recurringExpenses / 4;

      balance += weekReceivables - weeklyRecurring;

      weeks.push({
        name: `Sem ${w}`,
        projected: Math.round(balance),
      });
    }

    return { weeks, pendingReceivables, recurringExpenses, currentBalance: currentRevenue - currentExpenses - ownerSalary };
  }, [store.businessRevenue, store.businessExpenses, store.accountsReceivable, store.ownerSalaries]);

  const hasData = store.businessRevenue.length > 0 || store.businessExpenses.length > 0;

  return (
    <div>
      <p className="text-zinc-400 text-sm mb-6">Proyección de ingresos y gastos para los próximos 30 días</p>

      {!hasData ? (
        <EmptyState icon={TrendingUp} title="Sin datos para proyectar" description="Registra ingresos y gastos para ver la proyección de flujo de caja" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8" role="region" aria-label="Resumen de flujo de caja">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-zinc-400 text-sm mb-1">Balance actual</p>
              <p className={`text-xl font-semibold ${forecast.currentBalance >= 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
                {formatCurrency(forecast.currentBalance)}
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-zinc-400 text-sm mb-1">Cobros pendientes</p>
              <p className="text-xl font-semibold text-yellow-500">{formatCurrency(forecast.pendingReceivables)}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <p className="text-zinc-400 text-sm mb-1">Gastos recurrentes / mes</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(forecast.recurringExpenses)}</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Balance proyectado — próximas 4 semanas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast.weeks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#3f3f46" />
                <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '0.75rem' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ fill: '#22c55e', r: 5 }}
                  animationDuration={800}
                  name="Balance proyectado"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
