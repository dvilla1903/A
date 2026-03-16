'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth, todayString, getLastNMonths } from '@/lib/utils';
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenuePage() {
  const store = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const monthlyTotal = useMemo(
    () => store.businessRevenue.filter(r => isCurrentMonth(r.date)).reduce((s, r) => s + r.amount, 0),
    [store.businessRevenue]
  );

  const serviceTotal = useMemo(
    () => store.businessRevenue.filter(r => isCurrentMonth(r.date) && r.type === 'service').reduce((s, r) => s + r.amount, 0),
    [store.businessRevenue]
  );

  const productTotal = useMemo(
    () => store.businessRevenue.filter(r => isCurrentMonth(r.date) && r.type === 'product').reduce((s, r) => s + r.amount, 0),
    [store.businessRevenue]
  );

  const trendData = useMemo(() => {
    const months = getLastNMonths(6);
    return months.map(({ month, year, label }) => {
      const total = store.businessRevenue
        .filter(r => { const d = new Date(r.date); return d.getMonth() === month && d.getFullYear() === year; })
        .reduce((s, r) => s + r.amount, 0);
      return { name: label, total };
    });
  }, [store.businessRevenue]);

  const sorted = useMemo(
    () => [...store.businessRevenue].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [store.businessRevenue]
  );

  const editEntry = editId ? store.businessRevenue.find(r => r.id === editId) : null;

  const statusColors: Record<string, { bg: string; text: string }> = {
    paid: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    partial: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  };

  const statusLabels: Record<string, string> = { paid: 'Pagado', pending: 'Pendiente', partial: 'Parcial' };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      client: fd.get('client') as string,
      type: fd.get('type') as 'service' | 'product',
      amount: Number(fd.get('amount')),
      date: fd.get('date') as string,
      status: fd.get('status') as 'paid' | 'pending' | 'partial',
    };
    if (editId) store.updateBusinessRevenue(editId, data);
    else store.addBusinessRevenue(data);
    setShowModal(false);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
            <span className="text-zinc-400 text-sm">Total: </span>
            <span className="text-white font-semibold">{formatCurrency(monthlyTotal)}</span>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
            <span className="text-zinc-400 text-sm">Servicios: </span>
            <span className="text-[#22c55e] font-semibold">{formatCurrency(serviceTotal)}</span>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-3">
            <span className="text-zinc-400 text-sm">Productos: </span>
            <span className="text-[#4ade80] font-semibold">{formatCurrency(productTotal)}</span>
          </div>
        </div>
        <button onClick={() => { setEditId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#22c55e] text-black font-medium text-sm rounded-lg hover:bg-[#16a34a] transition-colors duration-200 cursor-pointer active:scale-[0.98]">
          <Plus className="w-4 h-4" aria-hidden="true" /> Agregar ingreso
        </button>
      </div>

      {/* Trend Chart */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <h3 className="text-white font-medium mb-4">Tendencia de ingresos</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="name" stroke="#3f3f46" />
            <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area type="monotone" dataKey="total" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={DollarSign} title="Sin ingresos registrados" description="Registra tu primer ingreso de negocio" actionLabel="Agregar ingreso" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-2">
          {sorted.map(entry => {
            const sc = statusColors[entry.status];
            return (
              <div key={entry.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center justify-between group hover:border-[#3a3a3a] transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white font-medium">{entry.client}</p>
                    <p className="text-zinc-500 text-sm">{entry.date}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#22c55e]">
                    {entry.type === 'service' ? 'Servicio' : 'Producto'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                    {statusLabels[entry.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#22c55e] font-semibold">{formatCurrency(entry.amount)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditId(entry.id); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-zinc-500 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => store.deleteBusinessRevenue(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); }} title={editId ? 'Editar ingreso' : 'Agregar ingreso'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="client" placeholder="Cliente / Fuente" required className="w-full" defaultValue={editEntry?.client} autoFocus />
          <select name="type" className="w-full" defaultValue={editEntry?.type || 'service'}>
            <option value="service">Servicio</option>
            <option value="product">Producto</option>
          </select>
          <input name="amount" type="number" placeholder="Monto" required className="w-full" min="0" defaultValue={editEntry?.amount} />
          <input name="date" type="date" required className="w-full" defaultValue={editEntry?.date || todayString()} />
          <select name="status" className="w-full" defaultValue={editEntry?.status || 'paid'}>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="partial">Parcial</option>
          </select>
          <button type="submit" className="w-full py-2.5 bg-[#22c55e] text-black font-medium rounded-lg hover:bg-[#16a34a] transition-colors">
            {editId ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
