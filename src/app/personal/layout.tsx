'use client';

import SubNav from '@/components/SubNav';

const personalNav = [
  { href: '/personal', label: 'Dashboard' },
  { href: '/personal/income', label: 'Ingresos' },
  { href: '/personal/expenses', label: 'Gastos' },
  { href: '/personal/budget', label: 'Presupuesto' },
  { href: '/personal/savings', label: 'Metas de ahorro' },
  { href: '/personal/weekly', label: 'Vista semanal' },
];

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">Finanzas Personales</h1>
      <p className="text-zinc-500 text-sm mb-6">Gestiona tus ingresos, gastos y metas de ahorro</p>
      <SubNav items={personalNav} />
      {children}
    </div>
  );
}
