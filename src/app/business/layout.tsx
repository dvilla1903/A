'use client';

import SubNav from '@/components/SubNav';

const businessNav = [
  { href: '/business', label: 'Dashboard' },
  { href: '/business/revenue', label: 'Ingresos' },
  { href: '/business/receivables', label: 'Por cobrar' },
  { href: '/business/expenses', label: 'Gastos' },
  { href: '/business/salary', label: 'Salario dueño' },
  { href: '/business/cost-analysis', label: 'Por línea' },
  { href: '/business/cash-flow', label: 'Flujo de caja' },
  { href: '/business/comparison', label: 'Comparativo' },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Finanzas del Negocio</h1>
      <p className="text-zinc-500 text-sm mb-6">Gestiona ingresos, gastos, cuentas por cobrar y rentabilidad</p>
      <SubNav items={businessNav} />
      {children}
    </div>
  );
}
