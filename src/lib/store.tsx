'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  IncomeEntry,
  ExpenseEntry,
  BudgetCategory,
  SavingsGoal,
  SavingsContribution,
  RevenueEntry,
  BusinessExpense,
  AccountReceivable,
  OwnerSalary,
  BusinessBudget,
} from './types';
import { generateId } from './utils';

interface StoreState {
  // Personal
  personalIncome: IncomeEntry[];
  personalExpenses: ExpenseEntry[];
  personalBudgets: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  // Business
  businessRevenue: RevenueEntry[];
  businessExpenses: BusinessExpense[];
  accountsReceivable: AccountReceivable[];
  ownerSalaries: OwnerSalary[];
  businessBudgets: BusinessBudget[];
}

interface StoreActions {
  // Personal Income
  addPersonalIncome: (entry: Omit<IncomeEntry, 'id'>) => void;
  updatePersonalIncome: (id: string, entry: Partial<IncomeEntry>) => void;
  deletePersonalIncome: (id: string) => void;
  // Personal Expenses
  addPersonalExpense: (entry: Omit<ExpenseEntry, 'id'>) => void;
  updatePersonalExpense: (id: string, entry: Partial<ExpenseEntry>) => void;
  deletePersonalExpense: (id: string) => void;
  // Budgets
  addPersonalBudget: (entry: Omit<BudgetCategory, 'id'>) => void;
  updatePersonalBudget: (id: string, entry: Partial<BudgetCategory>) => void;
  deletePersonalBudget: (id: string) => void;
  // Savings
  addSavingsGoal: (entry: Omit<SavingsGoal, 'id' | 'contributions' | 'currentAmount'>) => void;
  updateSavingsGoal: (id: string, entry: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addSavingsContribution: (goalId: string, amount: number) => void;
  // Business Revenue
  addBusinessRevenue: (entry: Omit<RevenueEntry, 'id'>) => void;
  updateBusinessRevenue: (id: string, entry: Partial<RevenueEntry>) => void;
  deleteBusinessRevenue: (id: string) => void;
  // Business Expenses
  addBusinessExpense: (entry: Omit<BusinessExpense, 'id'>) => void;
  updateBusinessExpense: (id: string, entry: Partial<BusinessExpense>) => void;
  deleteBusinessExpense: (id: string) => void;
  // Accounts Receivable
  addAccountReceivable: (entry: Omit<AccountReceivable, 'id'>) => void;
  updateAccountReceivable: (id: string, entry: Partial<AccountReceivable>) => void;
  deleteAccountReceivable: (id: string) => void;
  markReceivableAsPaid: (id: string) => void;
  // Owner Salary
  addOwnerSalary: (entry: Omit<OwnerSalary, 'id'>) => void;
  updateOwnerSalary: (id: string, entry: Partial<OwnerSalary>) => void;
  deleteOwnerSalary: (id: string) => void;
  // Business Budgets
  addBusinessBudget: (entry: Omit<BusinessBudget, 'id'>) => void;
  updateBusinessBudget: (id: string, entry: Partial<BusinessBudget>) => void;
  deleteBusinessBudget: (id: string) => void;
}

type Store = StoreState & StoreActions;

const StoreContext = createContext<Store | null>(null);

const STORAGE_KEY = 'finance-tracker-data';

const defaultState: StoreState = {
  personalIncome: [],
  personalExpenses: [],
  personalBudgets: [],
  savingsGoals: [],
  businessRevenue: [],
  businessExpenses: [],
  accountsReceivable: [],
  ownerSalaries: [],
  businessBudgets: [],
};

function loadState(): StoreState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: StoreState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveState(state);
    }
  }, [state, hydrated]);

  const updateState = useCallback((updater: (prev: StoreState) => StoreState) => {
    setState(prev => updater(prev));
  }, []);

  // Generic CRUD helpers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addItem = useCallback((key: keyof StoreState, item: any) => {
    updateState(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), { ...item, id: generateId() }],
    }));
  }, [updateState]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateItem = useCallback((key: keyof StoreState, id: string, updates: any) => {
    updateState(prev => ({
      ...prev,
      [key]: (prev[key] as any[]).map((item: any) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, [updateState]);

  const deleteItem = useCallback((key: keyof StoreState, id: string) => {
    updateState(prev => ({
      ...prev,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key]: (prev[key] as any[]).filter((item: any) => item.id !== id),
    }));
  }, [updateState]);

  const actions: StoreActions = {
    addPersonalIncome: (entry) => addItem('personalIncome', entry),
    updatePersonalIncome: (id, entry) => updateItem('personalIncome', id, entry),
    deletePersonalIncome: (id) => deleteItem('personalIncome', id),

    addPersonalExpense: (entry) => addItem('personalExpenses', entry),
    updatePersonalExpense: (id, entry) => updateItem('personalExpenses', id, entry),
    deletePersonalExpense: (id) => deleteItem('personalExpenses', id),

    addPersonalBudget: (entry) => addItem('personalBudgets', entry),
    updatePersonalBudget: (id, entry) => updateItem('personalBudgets', id, entry),
    deletePersonalBudget: (id) => deleteItem('personalBudgets', id),

    addSavingsGoal: (entry) => {
      updateState(prev => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, {
          ...entry,
          id: generateId(),
          currentAmount: 0,
          contributions: [],
        }],
      }));
    },
    updateSavingsGoal: (id, entry) => updateItem('savingsGoals', id, entry),
    deleteSavingsGoal: (id) => deleteItem('savingsGoals', id),
    addSavingsContribution: (goalId, amount) => {
      updateState(prev => ({
        ...prev,
        savingsGoals: prev.savingsGoals.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                currentAmount: goal.currentAmount + amount,
                contributions: [
                  ...goal.contributions,
                  { id: generateId(), goalId, amount, date: new Date().toISOString().split('T')[0] },
                ],
              }
            : goal
        ),
      }));
    },

    addBusinessRevenue: (entry) => addItem('businessRevenue', entry),
    updateBusinessRevenue: (id, entry) => updateItem('businessRevenue', id, entry),
    deleteBusinessRevenue: (id) => deleteItem('businessRevenue', id),

    addBusinessExpense: (entry) => addItem('businessExpenses', entry),
    updateBusinessExpense: (id, entry) => updateItem('businessExpenses', id, entry),
    deleteBusinessExpense: (id) => deleteItem('businessExpenses', id),

    addAccountReceivable: (entry) => addItem('accountsReceivable', entry),
    updateAccountReceivable: (id, entry) => updateItem('accountsReceivable', id, entry),
    deleteAccountReceivable: (id) => deleteItem('accountsReceivable', id),
    markReceivableAsPaid: (id) => {
      updateState(prev => ({
        ...prev,
        accountsReceivable: prev.accountsReceivable.map(ar =>
          ar.id === id
            ? { ...ar, status: 'paid' as const, amountPaid: ar.totalAmount }
            : ar
        ),
      }));
    },

    addOwnerSalary: (entry) => addItem('ownerSalaries', entry),
    updateOwnerSalary: (id, entry) => updateItem('ownerSalaries', id, entry),
    deleteOwnerSalary: (id) => deleteItem('ownerSalaries', id),

    addBusinessBudget: (entry) => addItem('businessBudgets', entry),
    updateBusinessBudget: (id, entry) => updateItem('businessBudgets', id, entry),
    deleteBusinessBudget: (id) => deleteItem('businessBudgets', id),
  };

  if (!hydrated) {
    return null;
  }

  return (
    <StoreContext.Provider value={{ ...state, ...actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
