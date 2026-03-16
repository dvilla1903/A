'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { PiggyBank, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';

export default function SavingsPage() {
  const store = useStore();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [contribGoalId, setContribGoalId] = useState<string | null>(null);

  const editEntry = editId ? store.savingsGoals.find(g => g.id === editId) : null;

  const handleGoalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      targetAmount: Number(fd.get('targetAmount')),
      targetDate: fd.get('targetDate') as string,
    };
    if (editId) {
      store.updateSavingsGoal(editId, data);
    } else {
      store.addSavingsGoal(data);
    }
    setShowGoalModal(false);
    setEditId(null);
  };

  const handleContribSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (contribGoalId) {
      store.addSavingsContribution(contribGoalId, Number(fd.get('amount')));
    }
    setShowContribModal(false);
    setContribGoalId(null);
  };

  const getStatus = (goal: typeof store.savingsGoals[0]) => {
    const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const totalDays = (targetDate.getTime() - new Date(goal.contributions[0]?.date || now.toISOString()).getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - new Date(goal.contributions[0]?.date || now.toISOString()).getTime()) / (1000 * 60 * 60 * 24);
    const expectedPct = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

    if (pct >= 100) return { label: 'Completado', color: '#22c55e' };
    if (pct >= expectedPct - 10) return { label: 'En camino', color: '#22c55e' };
    return { label: 'Atrasado', color: '#eab308' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-zinc-400 text-sm">Define metas de ahorro y registra contribuciones</p>
        <button
          onClick={() => { setEditId(null); setShowGoalModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nueva meta
        </button>
      </div>

      {store.savingsGoals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Sin metas de ahorro"
          description="Crea una meta de ahorro para comenzar a ahorrar con propósito"
          actionLabel="Crear meta"
          onAction={() => setShowGoalModal(true)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {store.savingsGoals.map(goal => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const status = getStatus(goal);

            return (
              <div key={goal.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 group hover:border-[#3a3a3a] transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{goal.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                      backgroundColor: `${status.color}15`,
                      color: status.color,
                    }}>
                      {status.label}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => { setEditId(goal.id); setShowGoalModal(true); }} className="p-1 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer" aria-label={`Editar ${goal.name}`}>
                        <Pencil className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button onClick={() => store.deleteSavingsGoal(goal.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors duration-200 cursor-pointer" aria-label={`Eliminar ${goal.name}`}>
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-semibold text-white">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-zinc-500 text-sm">/ {formatCurrency(goal.targetAmount)}</span>
                </div>

                <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-[#22c55e]"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 text-xs">Meta: {goal.targetDate} · {pct.toFixed(0)}%</span>
                  <button
                    onClick={() => { setContribGoalId(goal.id); setShowContribModal(true); }}
                    className="flex items-center gap-1 text-xs text-[#22c55e] hover:text-[#4ade80] transition-colors duration-200 font-medium cursor-pointer"
                    aria-label={`Contribuir a ${goal.name}`}
                  >
                    <TrendingUp className="w-3 h-3" aria-hidden="true" />
                    Contribuir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showGoalModal} onClose={() => { setShowGoalModal(false); setEditId(null); }} title={editId ? 'Editar meta' : 'Nueva meta de ahorro'}>
        <form onSubmit={handleGoalSubmit} className="space-y-3" role="form" aria-label={editId ? 'Editar meta' : 'Nueva meta de ahorro'}>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Nombre de la meta</span>
            <input name="name" placeholder="Nombre de la meta" required className="w-full" defaultValue={editEntry?.name} autoFocus />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Monto objetivo</span>
            <input name="targetAmount" type="number" placeholder="Monto objetivo" required className="w-full" min="0" defaultValue={editEntry?.targetAmount} />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Fecha objetivo</span>
            <input name="targetDate" type="date" required className="w-full" defaultValue={editEntry?.targetDate} />
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer">
            {editId ? 'Actualizar' : 'Crear meta'}
          </button>
        </form>
      </Modal>

      <Modal open={showContribModal} onClose={() => { setShowContribModal(false); setContribGoalId(null); }} title="Registrar contribución">
        <form onSubmit={handleContribSubmit} className="space-y-3" role="form" aria-label="Registrar contribución">
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Monto a contribuir</span>
            <input name="amount" type="number" placeholder="Monto a contribuir" required className="w-full" min="0" autoFocus />
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors duration-200 active:scale-[0.98] cursor-pointer">
            Contribuir
          </button>
        </form>
      </Modal>
    </div>
  );
}
