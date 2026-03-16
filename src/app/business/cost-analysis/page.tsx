'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, isCurrentMonth } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CostAnalysisPage() {
  const store = useStore();

  const analysis = useMemo(() => {
    const currentRevenue = store.businessRevenue.filter(r => isCurrentMonth(r.date));
    const currentExpenses = store.businessExpenses.filter(e => isCurrentMonth(e.date));

    const serviceRevenue = currentRevenue
      .filter(r => r.type === 'service')
      .reduce((s, r) => s + r.amount, 0);
    const productRevenue = currentRevenue
      .filter(r => r.type === 'product')
      .reduce((s, r) => s + r.amount, 0);

    // Split expenses 50/50 between services and products as a simple heuristic
    // In a real app, expenses would be tagged to business lines
    const totalExpenses = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const totalRevenue = serviceRevenue + productRevenue;
    const serviceExpenses = totalRevenue > 0 ? totalExpenses * (serviceRevenue / totalRevenue) : totalExpenses / 2;
    const productExpenses = totalRevenue > 0 ? totalExpenses * (productRevenue / totalRevenue) : totalExpenses / 2;

    const serviceMargin = serviceRevenue - serviceExpenses;
    const productMargin = productRevenue - productExpenses;
    const serviceMarginPct = serviceRevenue > 0 ? (serviceMargin / serviceRevenue) * 100 : 0;
    const productMarginPct = productRevenue > 0 ? (productMargin / productRevenue) * 100 : 0;

    return {
      services: {
        revenue: serviceRevenue,
        costs: serviceExpenses,
        margin: serviceMargin,
        marginPct: serviceMarginPct,
      },
      products: {
        revenue: productRevenue,
        costs: productExpenses,
        margin: productMargin,
        marginPct: productMarginPct,
      },
    };
  }, [store.businessRevenue, store.businessExpenses]);

  const chartData = [
    { name: 'Servicios', revenue: analysis.services.revenue, costs: analysis.services.costs, margin: analysis.services.margin },
    { name: 'Productos', revenue: analysis.products.revenue, costs: analysis.products.costs, margin: analysis.products.margin },
  ];

  const hasData = analysis.services.revenue > 0 || analysis.products.revenue > 0;

  return (
    <div>
      <p className="text-zinc-400 text-sm mb-6">Compara la rentabilidad de tus líneas de negocio</p>

      {!hasData ? (
        <EmptyState icon={BarChart3} title="Sin datos de análisis" description="Registra ingresos como Servicio o Producto para ver el análisis por línea" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Services */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Servicios</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400 text-sm">Ingresos</span>
                  <span className="text-[#22c55e] font-medium">{formatCurrency(analysis.services.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 text-sm">Costo estimado</span>
                  <span className="text-zinc-300 font-medium">{formatCurrency(analysis.services.costs)}</span>
                </div>
                <div className="border-t border-[#2a2a2a] pt-3 flex justify-between">
                  <span className="text-zinc-400 text-sm">Margen bruto</span>
                  <span className={`font-semibold ${analysis.services.margin >= 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
                    {formatCurrency(analysis.services.margin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 text-sm">Margen %</span>
                  <span className={`font-semibold ${analysis.services.marginPct >= 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
                    {analysis.services.marginPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Productos</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400 text-sm">Ingresos</span>
                  <span className="text-[#4ade80] font-medium">{formatCurrency(analysis.products.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 text-sm">Costo estimado</span>
                  <span className="text-zinc-300 font-medium">{formatCurrency(analysis.products.costs)}</span>
                </div>
                <div className="border-t border-[#2a2a2a] pt-3 flex justify-between">
                  <span className="text-zinc-400 text-sm">Margen bruto</span>
                  <span className={`font-semibold ${analysis.products.margin >= 0 ? 'text-[#4ade80]' : 'text-red-400'}`}>
                    {formatCurrency(analysis.products.margin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 text-sm">Margen %</span>
                  <span className={`font-semibold ${analysis.products.marginPct >= 0 ? 'text-[#4ade80]' : 'text-red-400'}`}>
                    {analysis.products.marginPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Comparativo visual</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#3f3f46" />
                <YAxis stroke="#3f3f46" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#22c55e" name="Ingresos" radius={[4, 4, 0, 0]} animationDuration={800} />
                <Bar dataKey="costs" fill="#3f3f46" name="Costos" radius={[4, 4, 0, 0]} animationDuration={800} />
                <Bar dataKey="margin" fill="#4ade80" name="Margen" radius={[4, 4, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
