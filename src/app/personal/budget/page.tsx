'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth } from '@/lib/utils';
import { PERSONAL_EXPENSE_CATEGORIES } from '@/lib/types';
import { Target, Plus, Pencil, Trash2 } from 'lucide-react';

export default function BudgetPage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const spentByCategory = useMemo(() => {
    const result: Record<string, number> = {};
    store.personalExpenses
      .filter(e => isCurrentMonth(e.date))
      .forEach(e => { result[e.category] = (result[e.category] || 0) + e.amount; });
    return result;
  }, [store.personalExpenses]);

  const editEntry = editId ? store.personalBudgets.find(b => b.id === editId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      category: fd.get('category') as string,
      limit: Number(fd.get('limit')),
    };
    if (editId) {
      store.updatePersonalBudget(editId, data);
    } else {
      store.addPersonalBudget(data);
    }
    setShowModal(false);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-400 text-sm">Define límites de gasto por categoría para controlar tus finanzas</p>
        <button
          onClick={() => { setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Agregar presupuesto
        </button>
      </div>

      {store.personalBudgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Sin presupuestos definidos"
          description="Crea un presupuesto por categoría para controlar cuánto gastas"
          actionLabel="Crear presupuesto"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {store.personalBudgets.map(budget => {
            const spent = spentByCategory[budget.category] || 0;
            const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
            const remaining = budget.limit - spent;
            const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#eab308' : '#22c55e';

            return (
              <div key={budget.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 group hover:border-[#3a3a3a] transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium capitalize">{budget.category}</span>
                    {pct >= 80 && pct < 100 && (
                      <span className="text-yellow-500 text-xs font-medium">⚠ Casi al límite</span>
                    )}
                    {pct >= 100 && (
                      <span className="text-red-400 text-xs font-medium">Excedido</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-sm">
                      {formatCurrency(remaining > 0 ? remaining : 0)} restante de {formatCurrency(budget.limit)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => { setEditId(budget.id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer" aria-label={`Editar presupuesto ${budget.category}`}>
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button onClick={() => store.deletePersonalBudget(budget.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors duration-200 cursor-pointer" aria-label={`Eliminar presupuesto ${budget.category}`}>
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                  />
                </div>
                <p className="text-zinc-600 text-xs mt-2">{formatCurrency(spent)} gastado · {pct.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar presupuesto' : 'Agregar presupuesto'}>
        <form onSubmit={handleSubmit} className="space-y-3" role="form" aria-label={editId ? 'Editar presupuesto' : 'Agregar presupuesto'}>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Categoría</span>
            <select name="category" className="w-full" defaultValue={editEntry?.category || PERSONAL_EXPENSE_CATEGORIES[0]}>
              {PERSONAL_EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Límite mensual</span>
            <input name="limit" type="number" placeholder="Límite mensual" required className="w-full" min="0" defaultValue={editEntry?.limit} />
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer">
            {editId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
