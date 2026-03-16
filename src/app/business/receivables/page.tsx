'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, todayString } from '@/lib/utils';
import { Receipt, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

export default function ReceivablesPage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...store.accountsReceivable].sort((a, b) => {
      if (a.status === 'paid' && b.status !== 'paid') return 1;
      if (a.status !== 'paid' && b.status === 'paid') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [store.accountsReceivable]);

  const totalPending = useMemo(
    () => store.accountsReceivable
      .filter(ar => ar.status !== 'paid')
      .reduce((s, ar) => s + (ar.totalAmount - ar.amountPaid), 0),
    [store.accountsReceivable]
  );

  const editEntry = editId ? store.accountsReceivable.find(ar => ar.id === editId) : null;

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      client: fd.get('client') as string,
      description: fd.get('description') as string,
      totalAmount: Number(fd.get('totalAmount')),
      amountPaid: Number(fd.get('amountPaid')),
      dueDate: fd.get('dueDate') as string,
      status: (Number(fd.get('amountPaid')) >= Number(fd.get('totalAmount'))
        ? 'paid'
        : Number(fd.get('amountPaid')) > 0
        ? 'partial'
        : 'pending') as 'paid' | 'partial' | 'pending',
    };
    if (editId) store.updateAccountReceivable(editId, data);
    else store.addAccountReceivable(data);
    setShowModal(false);
    setEditId(null);
  };

  const statusBadge = (status: string, dueDate: string) => {
    if (isOverdue(dueDate, status)) return { label: 'Vencido', bg: 'bg-red-500/10', text: 'text-red-400' };
    if (status === 'paid') return { label: 'Pagado', bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' };
    if (status === 'partial') return { label: 'Parcial', bg: 'bg-orange-500/10', text: 'text-orange-400' };
    return { label: 'Pendiente', bg: 'bg-yellow-500/10', text: 'text-yellow-500' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
          <span className="text-zinc-400 text-sm">Total pendiente: </span>
          <span className="text-yellow-500 font-semibold text-lg">{formatCurrency(totalPending)}</span>
        </div>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors duration-200 cursor-pointer active:scale-[0.98]">
          <Plus className="w-4 h-4" aria-hidden="true" /> Agregar cuenta
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Receipt} title="Sin cuentas por cobrar" description="Registra facturas o servicios pendientes de cobro" actionLabel="Agregar cuenta" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => {
            const badge = statusBadge(entry.status, entry.dueDate);
            const balance = entry.totalAmount - entry.amountPaid;
            const overdue = isOverdue(entry.dueDate, entry.status);

            return (
              <div key={entry.id} className={`bg-[#1a1a1a] border rounded-xl px-5 py-4 flex items-center justify-between group transition-colors duration-200 ${overdue ? 'border-red-500/20 hover:border-red-500/40' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <p className="text-white font-medium">{entry.client}</p>
                    <p className="text-zinc-500 text-sm">{entry.description}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-zinc-400 text-xs">Vence: {entry.dueDate}</p>
                    <p className="text-zinc-500 text-xs">Pagado: {formatCurrency(entry.amountPaid)} / {formatCurrency(entry.totalAmount)}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className={`font-semibold ${entry.status === 'paid' ? 'text-zinc-500' : 'text-white'}`}>
                    {formatCurrency(balance)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {entry.status !== 'paid' && (
                      <button onClick={() => store.markReceivableAsPaid(entry.id)} className="p-1.5 rounded-lg hover:bg-[#22c55e]/10 text-zinc-500 hover:text-[#22c55e] transition-colors duration-200 cursor-pointer" aria-label="Marcar como pagado">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                    <button onClick={() => { setEditId(entry.id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer" aria-label="Editar cuenta"><Pencil className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    <button onClick={() => store.deleteAccountReceivable(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors duration-200 cursor-pointer" aria-label="Eliminar cuenta"><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar cuenta' : 'Nueva cuenta por cobrar'}>
        <form onSubmit={handleSubmit} className="space-y-3" role="form" aria-label={editId ? 'Editar cuenta' : 'Nueva cuenta por cobrar'}>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Cliente</span>
            <input name="client" placeholder="Cliente" required className="w-full" defaultValue={editEntry?.client} autoFocus />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Descripción</span>
            <input name="description" placeholder="Descripción" required className="w-full" defaultValue={editEntry?.description} />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Monto total</span>
            <input name="totalAmount" type="number" placeholder="Monto total" required className="w-full" min="0" defaultValue={editEntry?.totalAmount} />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Monto pagado</span>
            <input name="amountPaid" type="number" placeholder="Monto pagado" required className="w-full" min="0" defaultValue={editEntry?.amountPaid || 0} />
          </label>
          <label className="block">
            <span className="text-zinc-400 text-xs mb-1 block">Fecha de vencimiento</span>
            <input name="dueDate" type="date" required className="w-full" defaultValue={editEntry?.dueDate || todayString()} />
          </label>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors duration-200 cursor-pointer active:scale-[0.98]">
            {editId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
