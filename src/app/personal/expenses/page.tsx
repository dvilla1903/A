'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth, todayString } from '@/lib/utils';
import { PERSONAL_EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/lib/types';
import { ShoppingCart, Plus, Pencil, Trash2, RefreshCw, Filter } from 'lucide-react';

export default function ExpensesPage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let items = [...store.personalExpenses];
    if (filterCategory !== 'all') items = items.filter(e => e.category === filterCategory);
    if (filterDateFrom) items = items.filter(e => e.date >= filterDateFrom);
    if (filterDateTo) items = items.filter(e => e.date <= filterDateTo);
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.personalExpenses, filterCategory, filterDateFrom, filterDateTo]);

  const monthlyTotal = useMemo(
    () => store.personalExpenses.filter(e => isCurrentMonth(e.date)).reduce((s, e) => s + e.amount, 0),
    [store.personalExpenses]
  );

  const editEntry = editId ? store.personalExpenses.find(e => e.id === editId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      description: fd.get('description') as string,
      amount: Number(fd.get('amount')),
      category: fd.get('category') as string,
      date: fd.get('date') as string,
      note: fd.get('note') as string || undefined,
      isRecurring: fd.get('isRecurring') === 'on',
    };
    if (editId) {
      store.updatePersonalExpense(editId, data);
    } else {
      store.addPersonalExpense(data);
    }
    setShowModal(false);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
            <span className="text-zinc-400 text-sm">Total del mes: </span>
            <span className="text-white font-semibold text-lg">{formatCurrency(monthlyTotal)}</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 cursor-pointer ${
              showFilters ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#1a1a1a] text-zinc-400 hover:text-white border border-[#2a2a2a]'
            }`}
            aria-label="Mostrar filtros"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            Filtros
          </button>
        </div>
        <button
          onClick={() => { setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar gasto
        </button>
      </div>

      {showFilters && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6 flex gap-4 animate-in">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="flex-1">
            <option value="all">Todas las categorías</option>
            {PERSONAL_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} placeholder="Desde" className="flex-1" />
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} placeholder="Hasta" className="flex-1" />
          <button
            onClick={() => { setFilterCategory('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
            className="px-3 py-2 text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Sin gastos registrados"
          description="Agrega tu primer gasto para comenzar a controlar tus finanzas"
          actionLabel="Agregar gasto"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center justify-between group hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#22c55e' }} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{entry.description}</p>
                    {entry.isRecurring && <RefreshCw className="w-3 h-3 text-zinc-500" />}
                  </div>
                  <p className="text-zinc-500 text-sm">{entry.date}{entry.note ? ` · ${entry.note}` : ''}</p>
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
                  <button onClick={() => { setEditId(entry.id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => store.deletePersonalExpense(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar gasto' : 'Agregar gasto'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="description" placeholder="Descripción" required className="w-full" defaultValue={editEntry?.description} autoFocus />
          <select name="category" className="w-full" defaultValue={editEntry?.category || 'food'}>
            {PERSONAL_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="amount" type="number" placeholder="Monto" required className="w-full" min="0" defaultValue={editEntry?.amount} />
          <input name="date" type="date" required className="w-full" defaultValue={editEntry?.date || todayString()} />
          <input name="note" placeholder="Nota (opcional)" className="w-full" defaultValue={editEntry?.note} />
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
