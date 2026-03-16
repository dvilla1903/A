'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth, todayString } from '@/lib/utils';
import { BUSINESS_EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/types';
import { CreditCard, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

export default function BusinessExpensesPage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...store.businessExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [store.businessExpenses]
  );

  const spentByCategory = useMemo(() => {
    const result: Record<string, number> = {};
    store.businessExpenses
      .filter(e => isCurrentMonth(e.date))
      .forEach(e => { result[e.category] = (result[e.category] || 0) + e.amount; });
    return result;
  }, [store.businessExpenses]);

  const monthlyTotal = useMemo(
    () => store.businessExpenses.filter(e => isCurrentMonth(e.date)).reduce((s, e) => s + e.amount, 0),
    [store.businessExpenses]
  );

  const editEntry = editId ? store.businessExpenses.find(e => e.id === editId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      description: fd.get('description') as string,
      amount: Number(fd.get('amount')),
      category: fd.get('category') as string,
      date: fd.get('date') as string,
      isRecurring: fd.get('isRecurring') === 'on',
    };
    if (editId) store.updateBusinessExpense(editId, data);
    else store.addBusinessExpense(data);
    setShowModal(false);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
          <span className="text-zinc-400 text-sm">Total del mes: </span>
          <span className="text-white font-semibold text-lg">{formatCurrency(monthlyTotal)}</span>
        </div>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors">
          <Plus className="w-4 h-4" /> Agregar gasto
        </button>
      </div>

      {/* Budget Progress */}
      {store.businessBudgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {store.businessBudgets.map(budget => {
            const spent = spentByCategory[budget.category] || 0;
            const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#eab308' : '#22c55e';
            return (
              <div key={budget.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-sm capitalize">{budget.category}</span>
                  <span className="text-zinc-500 text-xs">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                </div>
                <p className="text-zinc-600 text-xs mt-1">{formatCurrency(spent)} / {formatCurrency(budget.limit)}</p>
              </div>
            );
          })}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={CreditCard} title="Sin gastos registrados" description="Registra los gastos operativos de tu negocio" actionLabel="Agregar gasto" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => (
            <div key={entry.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center justify-between group hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#22c55e' }} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{entry.description}</p>
                    {entry.isRecurring && <RefreshCw className="w-3 h-3 text-zinc-500" />}
                  </div>
                  <p className="text-zinc-500 text-sm">{entry.date}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                  backgroundColor: `${CATEGORY_COLORS[entry.category] || '#22c55e'}15`,
                  color: CATEGORY_COLORS[entry.category] || '#22c55e',
                }}>
                  {entry.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{formatCurrency(entry.amount)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditId(entry.id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => store.deleteBusinessExpense(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar gasto' : 'Agregar gasto'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="description" placeholder="Descripción" required className="w-full" defaultValue={editEntry?.description} autoFocus />
          <select name="category" className="w-full" defaultValue={editEntry?.category || BUSINESS_EXPENSE_CATEGORIES[0]}>
            {BUSINESS_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="amount" type="number" placeholder="Monto" required className="w-full" min="0" defaultValue={editEntry?.amount} />
          <input name="date" type="date" required className="w-full" defaultValue={editEntry?.date || todayString()} />
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input type="checkbox" name="isRecurring" defaultChecked={editEntry?.isRecurring} className="accent-[#22c55e]" />
            Gasto recurrente
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors">
            {editId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
