'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { exportToCSV } from '@/lib/utils';
import { Download, Trash2, Database } from 'lucide-react';

export default function SettingsPage() {
  const store = useStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = (type: string) => {
    switch (type) {
      case 'personal-income':
        exportToCSV(store.personalIncome, 'ingresos-personales');
        break;
      case 'personal-expenses':
        exportToCSV(store.personalExpenses, 'gastos-personales');
        break;
      case 'business-revenue':
        exportToCSV(store.businessRevenue, 'ingresos-negocio');
        break;
      case 'business-expenses':
        exportToCSV(store.businessExpenses, 'gastos-negocio');
        break;
      case 'receivables':
        exportToCSV(store.accountsReceivable, 'cuentas-por-cobrar');
        break;
    }
  };

  const handleClearAll = () => {
    if (confirmClear) {
      localStorage.removeItem('finance-tracker-data');
      window.location.reload();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" role="main" aria-label="Settings page">
      <h1 className="text-2xl font-semibold text-white mb-1">Configuración</h1>
      <p className="text-zinc-500 text-sm mb-8">Gestión de datos y exportaciones</p>

      {/* Data Stats */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6" role="region" aria-label="Stored data statistics">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-[#22c55e]" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-white font-medium">Datos almacenados</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Ingresos personales</span>
            <span className="text-white">{store.personalIncome.length}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Gastos personales</span>
            <span className="text-white">{store.personalExpenses.length}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Ingresos negocio</span>
            <span className="text-white">{store.businessRevenue.length}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Gastos negocio</span>
            <span className="text-white">{store.businessExpenses.length}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Cuentas por cobrar</span>
            <span className="text-white">{store.accountsReceivable.length}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Metas de ahorro</span>
            <span className="text-white">{store.savingsGoals.length}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6" role="region" aria-label="Export data as CSV">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-[#22c55e]" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-white font-medium">Exportar datos (CSV)</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'personal-income', label: 'Ingresos personales' },
            { key: 'personal-expenses', label: 'Gastos personales' },
            { key: 'business-revenue', label: 'Ingresos negocio' },
            { key: 'business-expenses', label: 'Gastos negocio' },
            { key: 'receivables', label: 'Cuentas por cobrar' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => handleExport(item.key)}
              aria-label={`Export ${item.label} as CSV`}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-sm text-zinc-300 hover:text-white hover:border-[#3a3a3a] transition-colors duration-200 cursor-pointer active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1a1a1a] border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-400" strokeWidth={1.5} />
          <h2 className="text-red-400 font-medium">Zona de peligro</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-4">
          Esta acción eliminará todos tus datos permanentemente. Esta acción no se puede deshacer.
        </p>
        <button
          onClick={handleClearAll}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            confirmClear
              ? 'bg-red-500 text-white'
              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
          }`}
        >
          {confirmClear ? 'Confirmar: Eliminar todo' : 'Eliminar todos los datos'}
        </button>
      </div>
    </div>
  );
}
