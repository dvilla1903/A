'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import { isCurrentMonth, isLastMonth, formatCurrency, getWeekOfMonth, todayString } from '@/lib/utils';
import { PERSONAL_EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '@/lib/types';
import { Plus } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

export default function PersonalDashboard() {
  const store = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');

  const stats = useMemo(() => {
    const income = store.personalIncome.filter(i => isCurrentMonth(i.date)).reduce((s, i) => s + i.amount, 0);
    const expenses = store.personalExpenses.filter(e => isCurrentMonth(e.date)).reduce((s, e) => s + e.amount, 0);
    const prevIncome = store.personalIncome.filter(i => isLastMonth(i.date)).reduce((s, i) => s + i.amount, 0);
    const prevExpenses = store.personalExpenses.filter(e => isLastMonth(e.date)).reduce((s, e) => s + e.amount, 0);
    return { income, expenses, balance: income - expenses, prevIncome, prevExpenses, prevBalance: prevIncome - prevExpenses };
  }, [store.personalIncome, store.personalExpenses]);

  const donutData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    store.personalExpenses
      .filter(e => isCurrentMonth(e.date))
      .forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [store.personalExpenses]);

  const weeklyData = useMemo(() => {
    const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    store.personalExpenses
      .filter(e => isCurrentMonth(e.date))
      .forEach(e => {
        const w = getWeekOfMonth(e.date);
        weeks[w] = (weeks[w] || 0) + e.amount;
      });
    return Object.entries(weeks)
      .filter(([, v]) => v > 0 || parseInt(Object.keys(weeks)[0]) <= 4)
      .slice(0, 5)
      .map(([week, amount]) => ({ name: `Sem ${week}`, amount }));
  }, [store.personalExpenses]);

  const handleQuickAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (addType === 'income') {
      store.addPersonalIncome({
        source: fd.get('source') as string,
        amount: Number(fd.get('amount')),
        date: fd.get('date') as string,
        category: fd.get('category') as string,
      });
    } else {
      store.addPersonalExpense({
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
      {/* Quick Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#22c55e]/20 hover:bg-[#16a34a] transition-all hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6 text-black" />
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Ingresos del mes" value={stats.income} previousValue={stats.prevIncome} delay={0} />
        <StatCard title="Gastos del mes" value={stats.expenses} previousValue={stats.prevExpenses} delay={100} positive={false} />
        <StatCard title="Balance disponible" value={stats.balance} previousValue={stats.prevBalance} delay={200} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Gastos por categoría</h3>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  animationDuration={800}
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#22c55e'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-zinc-600 text-sm">
              Sin gastos este mes
            </div>
          )}
          {donutData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {donutData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#22c55e' }} />
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Bar Chart */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-white font-medium mb-4">Gasto semanal</h3>
          {weeklyData.some(w => w.amount > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#3f3f46" />
                <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-zinc-600 text-sm">
              Sin gastos esta semana
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar transacción">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAddType('income')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              addType === 'income' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a]'
            }`}
          >
            Ingreso
          </button>
          <button
            onClick={() => setAddType('expense')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              addType === 'expense' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#1a1a1a] text-zinc-400 border border-[#2a2a2a]'
            }`}
          >
            Gasto
          </button>
        </div>
        <form onSubmit={handleQuickAdd} className="space-y-3">
          {addType === 'income' ? (
            <>
              <input name="source" placeholder="Fuente de ingreso" required className="w-full" autoFocus />
              <select name="category" className="w-full">
                {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          ) : (
            <>
              <input name="description" placeholder="Descripción del gasto" required className="w-full" autoFocus />
              <select name="category" className="w-full">
                {PERSONAL_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </>
          )}
          <input name="amount" type="number" placeholder="Monto" required className="w-full" min="0" />
          <input name="date" type="date" defaultValue={todayString()} required className="w-full" />
          <button
            type="submit"
            className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
