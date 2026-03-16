export interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
  category: string;
}

export interface ExpenseEntry {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  isRecurring: boolean;
}

export interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  contributions: SavingsContribution[];
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
}

export interface RevenueEntry {
  id: string;
  client: string;
  type: 'service' | 'product';
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'partial';
}

export interface BusinessExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
}

export interface AccountReceivable {
  id: string;
  client: string;
  description: string;
  totalAmount: number;
  amountPaid: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
}

export interface OwnerSalary {
  id: string;
  amount: number;
  month: number;
  year: number;
}

export interface BusinessBudget {
  id: string;
  category: string;
  limit: number;
}

export type PersonalExpenseCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'utilities'
  | 'health'
  | 'education'
  | 'shopping'
  | 'housing'
  | 'other';

export type BusinessExpenseCategory =
  | 'tools'
  | 'marketing'
  | 'supplies'
  | 'transport'
  | 'rent'
  | 'software'
  | 'misc';

export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'rent'
  | 'investments'
  | 'other';

export const PERSONAL_EXPENSE_CATEGORIES: PersonalExpenseCategory[] = [
  'food', 'transport', 'entertainment', 'utilities', 'health', 'education', 'shopping', 'housing', 'other'
];

export const BUSINESS_EXPENSE_CATEGORIES: BusinessExpenseCategory[] = [
  'tools', 'marketing', 'supplies', 'transport', 'rent', 'software', 'misc'
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'salary', 'freelance', 'rent', 'investments', 'other'
];

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#22c55e',
  transport: '#4ade80',
  entertainment: '#16a34a',
  utilities: '#86efac',
  health: '#15803d',
  education: '#a3e635',
  shopping: '#34d399',
  housing: '#10b981',
  other: '#6ee7b7',
  tools: '#22c55e',
  marketing: '#4ade80',
  supplies: '#16a34a',
  rent: '#86efac',
  software: '#15803d',
  misc: '#34d399',
  salary: '#22c55e',
  freelance: '#4ade80',
  investments: '#16a34a',
};
