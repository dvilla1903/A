'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import StatCard from '@/components/StatCard';
import { isCurrentMonth, isLastMonth, getLastNMonths, formatCurrency } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

export default function OverviewPage() {
  const store = useStore();
  const [showPersonal, setShowPersonal] = useState(true);
  const [showBusiness, setShowBusiness] = useState(true);

  const personal = useMemo(() => {
    const incomeThisMonth = store.personalIncome
      .filter(i => isCurrentMonth(i.date))
      .reduce((s, i) => s + i.amount, 0);
    const expensesThisMonth = store.personalExpenses
      .filter(e => isCurrentMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);
    const incomeLastMonth = store.personalIncome
      .filter(i => isLastMonth(i.date))
      .reduce((s, i) => s + i.amount, 0);
    const expensesLastMonth = store.personalExpenses
      .filter(e => isLastMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);

    return {
      income: incomeThisMonth,
      expenses: expensesThisMonth,
      balance: incomeThisMonth - expensesThisMonth,
      prevIncome: incomeLastMonth,
      prevExpenses: expensesLastMonth,
    };
  }, [store.personalIncome, store.personalExpenses]);

  const business = useMemo(() => {
    const revenueThisMonth = store.businessRevenue
      .filter(r => isCurrentMonth(r.date))
      .reduce((s, r) => s + r.amount, 0);
    const expensesThisMonth = store.businessExpenses
      .filter(e => isCurrentMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);
    const salaryThisMonth = store.ownerSalaries
      .filter(s => {
        const now = new Date();
        return s.month === now.getMonth() && s.year === now.getFullYear();
      })
      .reduce((s, o) => s + o.amount, 0);
    const revenueLastMonth = store.businessRevenue
      .filter(r => isLastMonth(r.date))
      .reduce((s, r) => s + r.amount, 0);
    const expensesLastMonth = store.businessExpenses
      .filter(e => isLastMonth(e.date))
      .reduce((s, e) => s + e.amount, 0);

    const totalExpenses = expensesThisMonth + salaryThisMonth;

    return {
      revenue: revenueThisMonth,
      expenses: totalExpenses,
      profit: revenueThisMonth - totalExpenses,
      prevRevenue: revenueLastMonth,
      prevExpenses: expensesLastMonth,
    };
  }, [store.businessRevenue, store.businessExpenses, store.ownerSalaries]);

  const chartData = useMemo(() => {
    const months = getLastNMonths(6);
    return months.map(({ month, year, label }) => {
      const pIncome = store.personalIncome
        .filter(i => { const d = new Date(i.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, i) => s + i.amount, 0);
      const pExpenses = store.personalExpenses
        .filter(e => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, e) => s + e.amount, 0);
      const bRevenue = store.businessRevenue
        .filter(r => { const d = new Date(r.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + r.amount, 0);
      const bExpenses = store.businessExpenses
        .filter(e => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, e) => s + e.amount, 0);

      return {
        name: label,
        personal: pIncome - pExpenses,
        business: bRevenue - bExpenses,
      };
    });
  }, [store.personalIncome, store.personalExpenses, store.businessRevenue, store.businessExpenses]);

  return (
    <div className="max-w-7xl mx-auto" role="main" aria-label="Financial overview dashboard">
      <h1 className="text-2xl font-semibold text-white mb-1">Overview</h1>
      <p className="text-zinc-500 text-sm mb-8">Vista consolidada de tus finanzas personales y de negocio</p>

      <div className="grid grid-cols-2 gap-8 mb-10">
        {/* Personal */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Personal</h2>
          <div className="grid gap-4">
            <StatCard title="Ingresos del mes" value={personal.income} previousValue={personal.prevIncome} delay={0} />
            <StatCard title="Gastos del mes" value={personal.expenses} previousValue={personal.prevExpenses} delay={100} positive={false} />
            <StatCard title="Balance disponible" value={personal.balance} delay={200} />
          </div>
        </div>

        {/* Business */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Negocio</h2>
          <div className="grid gap-4">
            <StatCard title="Ingresos del mes" value={business.revenue} previousValue={business.prevRevenue} delay={0} />
            <StatCard title="Gastos operativos" value={business.expenses} previousValue={business.prevExpenses} delay={100} positive={false} />
            <StatCard title="Utilidad neta" value={business.profit} delay={200} />
          </div>
        </div>
      </div>

      {/* Combined Chart */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6" role="region" aria-label="Cash flow chart for the last 6 months">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-medium">Flujo de caja — Últimos 6 meses</h3>
          <fieldset className="flex items-center gap-4" role="group" aria-label="Chart series filters">
            <label htmlFor="toggle-personal" className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                id="toggle-personal"
                type="checkbox"
                checked={showPersonal}
                onChange={(e) => setShowPersonal(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#22c55e] rounded cursor-pointer"
              />
              <span className="text-zinc-400">Personal</span>
            </label>
            <label htmlFor="toggle-business" className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                id="toggle-business"
                type="checkbox"
                checked={showBusiness}
                onChange={(e) => setShowBusiness(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#4ade80] rounded cursor-pointer"
              />
              <span className="text-zinc-400">Negocio</span>
            </label>
          </fieldset>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="name" stroke="#3f3f46" />
            <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '0.75rem' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            {showPersonal && (
              <Line
                type="monotone"
                dataKey="personal"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                name="Personal"
                animationDuration={800}
              />
            )}
            {showBusiness && (
              <Line
                type="monotone"
                dataKey="business"
                stroke="#4ade80"
                strokeWidth={2}
                dot={{ fill: '#4ade80', r: 4 }}
                name="Negocio"
                animationDuration={800}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
