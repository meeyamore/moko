import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  ExpenseCategory, Notification, BudgetRequest,
  WorkerBudgetRequest, Expense, RecurringAllocation
} from '../types'

interface AppState {
  categories: ExpenseCategory[]
  notifications: Notification[]
  budgetRequests: BudgetRequest[]
  workerBudgetRequests: WorkerBudgetRequest[]
  expenses: Expense[]
  recurringAllocations: RecurringAllocation[]
  loadingData: boolean

  fetchCategories: () => Promise<void>
  fetchNotifications: (userId: string) => Promise<void>
  fetchBudgetRequests: (role: string, siteIds?: string[]) => Promise<void>
  fetchWorkerRequests: (role: string, userId: string, siteIds?: string[]) => Promise<void>
  fetchExpenses: (role: string, userId: string, siteIds?: string[]) => Promise<void>
  fetchRecurring: (role: string, userId: string, siteIds?: string[]) => Promise<void>

  addCategory: (name: string, createdBy: string) => Promise<void>
  toggleCategory: (id: string, isActive: boolean) => Promise<void>
  markNotificationsRead: (userId: string) => Promise<void>
  approveBudgetRequest: (id: string, reviewedBy: string, note?: string) => Promise<void>
  rejectBudgetRequest: (id: string, reviewedBy: string, note: string) => Promise<void>
  approveWorkerRequest: (id: string, reviewedBy: string, amount: number) => Promise<void>
  rejectWorkerRequest: (id: string, reviewedBy: string) => Promise<void>
  approveExpense: (id: string, approvedBy: string) => Promise<void>
  rejectExpense: (id: string, approvedBy: string, reason: string) => Promise<void>
  addRecurringAllocation: (alloc: Partial<RecurringAllocation>) => Promise<void>
  addExpense: (expense: Partial<Expense>) => Promise<void>
  inviteUser: (email: string, role: string, invitedBy: string) => Promise<string | null>
}

export const useAppStore = create<AppState>((set, get) => ({
  categories: [],
  notifications: [],
  budgetRequests: [],
  workerBudgetRequests: [],
  expenses: [],
  recurringAllocations: [],
  loadingData: false,

  fetchCategories: async () => {
    const { data } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name')
    if (data) set({ categories: data.map(c => ({
      id: c.id, name: c.name, isActive: c.is_active,
      isRecurring: c.is_recurring, createdBy: c.created_by, usageCount: 0
    }))})
  },

  fetchNotifications: async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) set({ notifications: data.map(n => ({
      id: n.id, type: n.type, title: n.title, message: n.message,
      read: n.read, severity: n.severity, createdAt: n.created_at
    }))})
  },

  fetchBudgetRequests: async (role, siteIds) => {
    let query = supabase
      .from('budget_requests')
      .select(`*, budget_request_items(*), profiles!budget_requests_requested_by_fkey(name), sites(name, projects(name))`)
      .order('created_at', { ascending: false })

    if (role === 'site_manager' && siteIds?.length) {
      query = query.in('site_id', siteIds)
    }

    const { data } = await query
    if (data) set({ budgetRequests: data.map(r => ({
      id: r.id,
      siteId: r.site_id,
      siteName: r.sites?.name || '',
      projectName: r.sites?.projects?.name || '',
      requestedBy: r.requested_by,
      requestedByName: r.profiles?.name || '',
      reason: r.reason || '',
      items: (r.budget_request_items || []).map((i: any) => ({
        id: i.id, categoryId: i.category_id, categoryName: i.category_id,
        amountRequested: i.amount_requested, amountApproved: i.amount_approved,
        currency: i.currency, status: i.status
      })),
      totalRequested: r.total_requested,
      totalApproved: r.total_approved,
      status: r.status,
      managerNote: r.manager_note,
      ceoAlerted: r.ceo_alerted,
      createdAt: r.created_at,
    }))})
  },

  fetchWorkerRequests: async (role, userId, siteIds) => {
    let query = supabase
      .from('worker_fund_requests')
      .select(`*, profiles!worker_fund_requests_worker_id_fkey(name), expense_categories(name)`)
      .order('created_at', { ascending: false })

    if (role === 'site_worker') query = query.eq('worker_id', userId)
    else if (role === 'site_manager' && siteIds?.length) query = query.in('site_id', siteIds)

    const { data } = await query
    if (data) set({ workerBudgetRequests: data.map(r => ({
      id: r.id, siteId: r.site_id, workerId: r.worker_id,
      workerName: r.profiles?.name || '',
      categoryId: r.category_id,
      categoryName: r.expense_categories?.name || '',
      amountRequested: r.amount_requested, amountApproved: r.amount_approved,
      currency: r.currency, reason: r.reason, status: r.status,
      reviewedBy: r.reviewed_by, createdAt: r.created_at,
    }))})
  },

  fetchExpenses: async (role, userId, siteIds) => {
    let query = supabase
      .from('expenses')
      .select(`*, profiles!expenses_submitted_by_fkey(name), expense_categories(name), sites(name, projects(name))`)
      .order('submitted_at', { ascending: false })

    if (role === 'site_worker') query = query.eq('submitted_by', userId)
    else if (role === 'site_manager' && siteIds?.length) query = query.in('site_id', siteIds)

    const { data } = await query
    if (data) set({ expenses: data.map(e => ({
      id: e.id, siteId: e.site_id,
      siteName: e.sites?.name || '',
      projectId: '', projectName: e.sites?.projects?.name || '',
      submittedBy: e.submitted_by,
      submittedByName: e.profiles?.name || '',
      categoryId: e.category_id,
      categoryName: e.expense_categories?.name || '',
      amount: e.amount, currency: e.currency, amountUsd: e.amount_usd || e.amount,
      paymentMethod: e.payment_method, description: e.description,
      vendor: e.vendor, receiptUrl: e.receipt_url,
      status: e.status, rejectionReason: e.rejection_reason,
      approvedBy: e.approved_by, approvedAt: e.approved_at,
      submittedAt: e.submitted_at, version: 1,
    }))})
  },

  fetchRecurring: async (role, userId, siteIds) => {
    let query = supabase
      .from('recurring_allocations')
      .select(`*, profiles!recurring_allocations_worker_id_fkey(name), expense_categories(name), sites(name)`)
      .order('created_at', { ascending: false })

    if (role === 'site_worker') query = query.eq('worker_id', userId)
    else if (role === 'site_manager' && siteIds?.length) query = query.in('site_id', siteIds)

    const { data } = await query
    if (data) set({ recurringAllocations: data.map(r => ({
      id: r.id, siteId: r.site_id, siteName: r.sites?.name || '',
      workerId: r.worker_id, workerName: r.profiles?.name || '',
      categoryId: r.category_id, categoryName: r.expense_categories?.name || '',
      amount: r.amount, currency: r.currency, frequency: r.frequency,
      status: r.status, effectiveFrom: r.effective_from, createdBy: r.created_by,
    }))})
  },

  addCategory: async (name, createdBy) => {
    const { data } = await supabase
      .from('expense_categories')
      .insert({ name, is_active: true, is_recurring: false, created_by: createdBy })
      .select().single()
    if (data) set(s => ({ categories: [...s.categories, {
      id: data.id, name: data.name, isActive: true,
      isRecurring: false, createdBy, usageCount: 0
    }]}))
  },

  toggleCategory: async (id, isActive) => {
    await supabase.from('expense_categories').update({ is_active: !isActive }).eq('id', id)
    set(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, isActive: !isActive } : c) }))
  },

  markNotificationsRead: async (userId) => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId)
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }))
  },

  approveBudgetRequest: async (id, reviewedBy, note) => {
    await supabase.from('budget_requests').update({
      status: 'approved', reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(), manager_note: note
    }).eq('id', id)
    set(s => ({ budgetRequests: s.budgetRequests.map(r =>
      r.id === id ? { ...r, status: 'approved' as const, managerNote: note } : r
    )}))
  },

  rejectBudgetRequest: async (id, reviewedBy, note) => {
    await supabase.from('budget_requests').update({
      status: 'rejected', reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(), manager_note: note
    }).eq('id', id)
    set(s => ({ budgetRequests: s.budgetRequests.map(r =>
      r.id === id ? { ...r, status: 'rejected' as const, managerNote: note } : r
    )}))
  },

  approveWorkerRequest: async (id, reviewedBy, amount) => {
    await supabase.from('worker_fund_requests').update({
      status: 'approved', reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(), amount_approved: amount
    }).eq('id', id)
    set(s => ({ workerBudgetRequests: s.workerBudgetRequests.map(r =>
      r.id === id ? { ...r, status: 'approved' as const, amountApproved: amount } : r
    )}))
  },

  rejectWorkerRequest: async (id, reviewedBy) => {
    await supabase.from('worker_fund_requests').update({
      status: 'rejected', reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString()
    }).eq('id', id)
    set(s => ({ workerBudgetRequests: s.workerBudgetRequests.map(r =>
      r.id === id ? { ...r, status: 'rejected' as const } : r
    )}))
  },

  approveExpense: async (id, approvedBy) => {
    await supabase.from('expenses').update({
      status: 'approved', approved_by: approvedBy,
      approved_at: new Date().toISOString()
    }).eq('id', id)
    set(s => ({ expenses: s.expenses.map(e =>
      e.id === id ? { ...e, status: 'approved' as const } : e
    )}))
  },

  rejectExpense: async (id, approvedBy, reason) => {
    await supabase.from('expenses').update({
      status: 'rejected', approved_by: approvedBy, rejection_reason: reason
    }).eq('id', id)
    set(s => ({ expenses: s.expenses.map(e =>
      e.id === id ? { ...e, status: 'rejected' as const, rejectionReason: reason } : e
    )}))
  },

  addRecurringAllocation: async (alloc) => {
    const { data } = await supabase.from('recurring_allocations').insert({
      site_id: alloc.siteId, worker_id: alloc.workerId,
      category_id: alloc.categoryId, amount: alloc.amount,
      currency: alloc.currency, frequency: alloc.frequency,
      status: 'active', effective_from: alloc.effectiveFrom,
      created_by: alloc.createdBy
    }).select().single()
    if (data) set(s => ({ recurringAllocations: [...s.recurringAllocations, {
      ...alloc as RecurringAllocation, id: data.id
    }]}))
  },

  addExpense: async (expense) => {
    const { data } = await supabase.from('expenses').insert({
      site_id: expense.siteId, submitted_by: expense.submittedBy,
      category_id: expense.categoryId, amount: expense.amount,
      currency: expense.currency, amount_usd: expense.amountUsd,
      payment_method: expense.paymentMethod, description: expense.description,
      vendor: expense.vendor, status: 'pending',
      submitted_at: new Date().toISOString()
    }).select().single()
    if (data) set(s => ({ expenses: [{ ...expense as Expense, id: data.id, version: 1 }, ...s.expenses] }))
  },

  inviteUser: async (email, role, invitedBy) => {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role }
    })
    if (error) return error.message
    await supabase.from('invitations').insert({
      email, role, invited_by: invitedBy, status: 'pending'
    })
    return null
  },
}))
