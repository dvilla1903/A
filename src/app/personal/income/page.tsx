'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth, todayString } from '@/lib/utils';
import { INCOME_CATEGORIES, CATEGORY_COLORS } from '@/lib/types';
import { Wallet, Plus, Pencil, Trash2 } from 'lucide-react';

export default function IncomePage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const monthlyTotal = useMemo(
    () => store.personalIncome.filter(i => isCurrentMonth(i.date)).reduce((s, i) => s + i.amount, 0),
    [store.personalIncome]
  );

  const sorted = useMemo(
    () => [...store.personalIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [store.personalIncome]
  );

  const editEntry = editId ? store.personalIncome.find(i => i.id === editId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      source: fd.get('source') as string,
      amount: Number(fd.get('amount')),
      date: fd.get('date') as string,
      category: fd.get('category') as string,
    };
    if (editId) {
      store.updatePersonalIncome(editId, data);
    } else {
      store.addPersonalIncome(data);
    }
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
        <button
          onClick={() => { setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Agregar ingreso
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin ingresos registrados"
          description="Agrega tu primer ingreso para comenzar a rastrear tus finanzas"
          actionLabel="Agregar ingreso"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => (
            <div key={entry.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center justify-between group hover:border-[#3a3a3a] transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#22c55e' }} />
                <div>
                  <p className="text-white font-medium">{entry.source}</p>
                  <p className="text-zinc-500 text-sm">{entry.date}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#22c55e]">
                  {entry.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#22c55e] font-semibold">{formatCurrency(entry.amount)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => { setEditId(entry.id); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer"
                    aria-label={`Editar ${entry.source}`}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => store.deletePersonalIncome(entry.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                    aria-label={`Eliminar ${entry.source}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar ingreso' : 'Agregar ingreso'}>
        <form onSubmit={handleSubmit} className="space-y-3" role="form" aria-label={editId ? 'Editar ingreso' : 'Agregar ingreso'}>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Fuente de ingreso</span>
            <input name="source" placeholder="Fuente de ingreso" required className="w-full" defaultValue={editEntry?.source} autoFocus />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Categoría</span>
            <select name="category" className="w-full" defaultValue={editEntry?.category || 'salary'}>
              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Monto</span>
            <input name="amount" type="number" placeholder="Monto" required className="w-full" min="0" defaultValue={editEntry?.amount} />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Fecha</span>
            <input name="date" type="date" required className="w-full" defaultValue={editEntry?.date || todayString()} />
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer">
            {editId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
