import { create } from 'zustand'
import type { ExpenseCategory, Notification, BudgetRequest, WorkerBudgetRequest, Expense, RecurringAllocation } from '../types'
import {
  CATEGORIES, NOTIFICATIONS, BUDGET_REQUESTS, WORKER_BUDGET_REQUESTS,
  EXPENSES, RECURRING_ALLOCATIONS
} from '../lib/data'

interface AppState {
  categories: ExpenseCategory[]
  notifications: Record<string, Notification[]>
  budgetRequests: BudgetRequest[]
  workerBudgetRequests: WorkerBudgetRequest[]
  expenses: Expense[]
  recurringAllocations: RecurringAllocation[]

  addCategory: (name: string, createdBy: string) => void
  toggleCategory: (id: string) => void
  markNotificationsRead: (userId: string) => void
  approveBudgetRequest: (id: string, reviewedBy: string, note?: string) => void
  rejectBudgetRequest: (id: string, reviewedBy: string, note: string) => void
  approveWorkerRequest: (id: string, reviewedBy: string) => void
  rejectWorkerRequest: (id: string, reviewedBy: string) => void
  approveExpense: (id: string, approvedBy: string) => void
  rejectExpense: (id: string, approvedBy: string, reason: string) => void
  addRecurringAllocation: (alloc: Omit<RecurringAllocation, 'id'>) => void
  addExpense: (expense: Omit<Expense, 'id' | 'version'>) => void
}

export const useAppStore = create<AppState>((set) => ({
  categories: CATEGORIES,
  notifications: NOTIFICATIONS,
  budgetRequests: BUDGET_REQUESTS,
  workerBudgetRequests: WORKER_BUDGET_REQUESTS,
  expenses: EXPENSES,
  recurringAllocations: RECURRING_ALLOCATIONS,

  addCategory: (name, createdBy) =>
    set(s => ({
      categories: [...s.categories, {
        id: 'c' + Date.now(), name, isActive: true, isRecurring: false,
        createdBy, usageCount: 0
      }]
    })),

  toggleCategory: (id) =>
    set(s => ({
      categories: s.categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    })),

  markNotificationsRead: (userId) =>
    set(s => ({
      notifications: {
        ...s.notifications,
        [userId]: (s.notifications[userId] || []).map(n => ({ ...n, read: true }))
      }
    })),

  approveBudgetRequest: (id, reviewedBy, note) =>
    set(s => ({
      budgetRequests: s.budgetRequests.map(r =>
        r.id === id ? { ...r, status: 'approved' as const, reviewedBy, reviewedAt: new Date().toISOString(), managerNote: note } : r
      )
    })),

  rejectBudgetRequest: (id, reviewedBy, note) =>
    set(s => ({
      budgetRequests: s.budgetRequests.map(r =>
        r.id === id ? { ...r, status: 'rejected' as const, reviewedBy, reviewedAt: new Date().toISOString(), managerNote: note } : r
      )
    })),

  approveWorkerRequest: (id, reviewedBy) =>
    set(s => ({
      workerBudgetRequests: s.workerBudgetRequests.map(r =>
        r.id === id ? { ...r, status: 'approved' as const, reviewedBy, amountApproved: r.amountRequested } : r
      )
    })),

  rejectWorkerRequest: (id, reviewedBy) =>
    set(s => ({
      workerBudgetRequests: s.workerBudgetRequests.map(r =>
        r.id === id ? { ...r, status: 'rejected' as const, reviewedBy } : r
      )
    })),

  approveExpense: (id, approvedBy) =>
    set(s => ({
      expenses: s.expenses.map(e =>
        e.id === id ? { ...e, status: 'approved' as const, approvedBy, approvedAt: new Date().toISOString() } : e
      )
    })),

  rejectExpense: (id, approvedBy, reason) =>
    set(s => ({
      expenses: s.expenses.map(e =>
        e.id === id ? { ...e, status: 'rejected' as const, approvedBy, rejectionReason: reason } : e
      )
    })),

  addRecurringAllocation: (alloc) =>
    set(s => ({
      recurringAllocations: [...s.recurringAllocations, { ...alloc, id: 'ra' + Date.now() }]
    })),

  addExpense: (expense) =>
    set(s => ({
      expenses: [{ ...expense, id: 'e' + Date.now(), version: 1 }, ...s.expenses]
    })),
}))
