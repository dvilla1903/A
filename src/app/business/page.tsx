'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import { isCurrentMonth, isLastMonth, formatCurrency, getLastNMonths, todayString } from '@/lib/utils';
import { BUSINESS_EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/types';
import { Plus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

export default function BusinessDashboard() {
  const store = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'revenue' | 'expense'>('revenue');

  const stats = useMemo(() => {
    const revenue = store.businessRevenue.filter(r => isCurrentMonth(r.date)).reduce((s, r) => s + r.amount, 0);
    const expenses = store.businessExpenses.filter(e => isCurrentMonth(e.date)).reduce((s, e) => s + e.amount, 0);
    const salary = store.ownerSalaries
      .filter(s => { const now = new Date(); return s.month === now.getMonth() && s.year === now.getFullYear(); })
      .reduce((s, o) => s + o.amount, 0);
    const totalExpenses = expenses + salary;

    const prevRevenue = store.businessRevenue.filter(r => isLastMonth(r.date)).reduce((s, r) => s + r.amount, 0);
    const prevExpenses = store.businessExpenses.filter(e => isLastMonth(e.date)).reduce((s, e) => s + e.amount, 0);

    return {
      revenue, expenses: totalExpenses, profit: revenue - totalExpenses,
      prevRevenue, prevExpenses,
    };
  }, [store.businessRevenue, store.businessExpenses, store.ownerSalaries]);

  const monthlyChartData = useMemo(() => {
    const months = getLastNMonths(6);
    return months.map(({ month, year, label }) => {
      const rev = store.businessRevenue
        .filter(r => { const d = new Date(r.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + r.amount, 0);
      const exp = store.businessExpenses
        .filter(e => { const d = new Date(e.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, e) => s + e.amount, 0);
      return { name: label, revenue: rev, expenses: exp };
    });
  }, [store.businessRevenue, store.businessExpenses]);

  const donutData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    store.businessExpenses
      .filter(e => isCurrentMonth(e.date))
      .forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [store.businessExpenses]);

  const handleQuickAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (addType === 'revenue') {
      store.addBusinessRevenue({
        client: fd.get('client') as string,
        type: fd.get('type') as 'service' | 'product',
        amount: Number(fd.get('amount')),
        date: fd.get('date') as string,
        status: fd.get('status') as 'paid' | 'pending' | 'partial',
      });
    } else {
      store.addBusinessExpense({
        description: fd.get('description') as string,
        amount: Number(fd.get('amount')),
        category: fd.get('category') as string,
        date: fd.get('date') as string,
        isRecurring: false,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div>
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#22c55e]/20 hover:bg-[#16a34a] transition-all hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6 text-black" />
      </button>

      {/* P&L Summary */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-6">
        <h3 className="text-zinc-400 text-sm mb-3">Estado de resultados del mes</h3>
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <span className="text-[#22c55e] font-medium">{formatCurrency(stats.revenue)}</span>
          <span className="text-zinc-600">Ingresos</span>
          <span className="text-zinc-600">−</span>
          <span className="text-white font-medium">{formatCurrency(stats.expenses)}</span>
          <span className="text-zinc-600">Gastos</span>
          <span className="text-zinc-600">=</span>
          <span className={`font-semibold ${stats.profit >= 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
            {formatCurrency(stats.profit)}
          </span>
          <span className="text-zinc-600">Utilidad</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Ingresos totales" value={stats.revenue} previousValue={stats.prevRevenue} delay={0} />
        <StatCard title="Gastos totales" value={stats.expenses} previousValue={stats.prevExpenses} delay={100} positive={false} />
        <StatCard title="Utilidad neta" value={stats.profit} delay={200} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Ingresos vs Gastos — 6 meses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#3f3f46" />
              <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} animationDuration={800} name="Ingresos" />
              <Bar dataKey="expenses" fill="#3f3f46" radius={[4, 4, 0, 0]} animationDuration={800} name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Gastos por categoría</h3>
          {donutData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" animationDuration={800} stroke="none">
                    {donutData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#22c55e'} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {donutData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#22c55e' }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm">Sin gastos este mes</div>
          )}
        </div>
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar transacción">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setAddType('revenue')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${addType === 'revenue' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a]'}`}>
            Ingreso
          </button>
          <button onClick={() => setAddType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${addType === 'expense' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a]'}`}>
            Gasto
          </button>
        </div>
        <form onSubmit={handleQuickAdd} className="space-y-3">
          {addType === 'revenue' ? (
            <>
              <input name="client" placeholder="Cliente / Fuente" required className="w-full" autoFocus />
              <select name="type" className="w-full">
                <option value="service">Servicio</option>
                <option value="product">Producto</option>
              </select>
              <select name="status" className="w-full">
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="partial">Parcial</option>
              </select>
            </>
          ) : (
            <>
              <input name="description" placeholder="Descripción" required className="w-full" autoFocus />
              <select name="category" className="w-full">
                {BUSINESS_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
          <input name="amount" type="number" placeholder="Monto" required className="w-full" min="0" />
          <input name="date" type="date" defaultValue={todayString()} required className="w-full" />
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors">
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
