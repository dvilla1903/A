'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, getFullMonthName, getCurrentMonth, getCurrentYear } from '@/lib/utils';
import { UserCircle, Plus, Pencil, Trash2 } from 'lucide-react';

export default function OwnerSalaryPage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...store.ownerSalaries].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    }),
    [store.ownerSalaries]
  );

  const currentMonthSalary = useMemo(
    () => store.ownerSalaries.find(s => s.month === getCurrentMonth() && s.year === getCurrentYear()),
    [store.ownerSalaries]
  );

  const yearTotal = useMemo(
    () => store.ownerSalaries.filter(s => s.year === getCurrentYear()).reduce((t, s) => t + s.amount, 0),
    [store.ownerSalaries]
  );

  const editEntry = editId ? store.ownerSalaries.find(s => s.id === editId) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      amount: Number(fd.get('amount')),
      month: Number(fd.get('month')),
      year: Number(fd.get('year')),
    };
    if (editId) store.updateOwnerSalary(editId, data);
    else store.addOwnerSalary(data);
    setShowModal(false);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
            <span className="text-zinc-400 text-sm">Este mes: </span>
            <span className="text-white font-semibold">{formatCurrency(currentMonthSalary?.amount || 0)}</span>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
            <span className="text-zinc-400 text-sm">Total {getCurrentYear()}: </span>
            <span className="text-white font-semibold">{formatCurrency(yearTotal)}</span>
          </div>
        </div>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors duration-200 cursor-pointer active:scale-[0.98]">
          <Plus className="w-4 h-4" aria-hidden="true" /> Registrar retiro
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 mb-6">
        <p className="text-zinc-400 text-sm">
          El salario del dueño se registra como gasto del negocio y se descuenta de la utilidad neta
          para calcular la rentabilidad real después de la compensación del propietario.
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={UserCircle} title="Sin retiros registrados" description="Registra tu retiro mensual como dueño del negocio" actionLabel="Registrar retiro" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => (
            <div key={entry.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center justify-between group hover:border-[#3a3a3a] transition-colors duration-200">
              <div>
                <p className="text-white font-medium">{getFullMonthName(entry.month)} {entry.year}</p>
                <p className="text-zinc-500 text-sm">Retiro del dueño</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">{formatCurrency(entry.amount)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => { setEditId(entry.id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer" aria-label="Editar retiro"><Pencil className="w-3.5 h-3.5" aria-hidden="true" /></button>
                  <button onClick={() => store.deleteOwnerSalary(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors duration-200 cursor-pointer" aria-label="Eliminar retiro"><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar retiro' : 'Registrar retiro'}>
        <form onSubmit={handleSubmit} className="space-y-3" role="form" aria-label={editId ? 'Editar retiro' : 'Registrar retiro'}>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Monto del retiro</span>
            <input name="amount" type="number" placeholder="Monto del retiro" required className="w-full" min="0" defaultValue={editEntry?.amount} autoFocus />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Mes</span>
            <select name="month" className="w-full" defaultValue={editEntry?.month ?? getCurrentMonth()}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getFullMonthName(i)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Año</span>
            <input name="year" type="number" placeholder="Año" required className="w-full" defaultValue={editEntry?.year || getCurrentYear()} />
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors duration-200 cursor-pointer active:scale-[0.98]">
            {editId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
