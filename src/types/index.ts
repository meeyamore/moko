export type Role = 'ceo' | 'manager' | 'site_manager' | 'site_worker'

export type Currency = 'USD' | 'MZN' | 'ZAR' | 'KRW'
export type PaymentMethod = 'cash' | 'card' | 'eft'
export type ExpenseStatus = 'pending' | 'approved' | 'rejected'
export type BudgetRequestStatus = 'pending' | 'approved' | 'adjusted' | 'rejected'
export type ProjectStatus = 'active' | 'completed' | 'on_hold'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar: string
  projectIds?: string[]
  siteIds?: string[]
  dualRole?: { role: Role; siteId?: string; projectId?: string }
}

export interface Project {
  id: string
  name: string
  country: string
  location: string
  status: ProjectStatus
  contractValue: number
  contractCurrency: Currency
  startDate: string
  expectedEndDate: string
  actualEndDate?: string
  managerIds: string[]
  siteIds: string[]
}

export interface Site {
  id: string
  projectId: string
  name: string
  location: string
  status: 'active' | 'completed'
  siteManagerIds: string[]
  workerIds: string[]
}

export interface ExpenseCategory {
  id: string
  name: string
  isActive: boolean
  isRecurring: boolean
  createdBy: string
  usageCount: number
}

export interface BudgetRequestItem {
  id: string
  categoryId: string
  categoryName: string
  amountRequested: number
  amountApproved?: number
  currency: Currency
  status: BudgetRequestStatus
}

export interface BudgetRequest {
  id: string
  siteId: string
  siteName: string
  projectName: string
  requestedBy: string
  requestedByName: string
  reason: string
  items: BudgetRequestItem[]
  totalRequested: number
  totalApproved?: number
  status: BudgetRequestStatus
  managerNote?: string
  reviewedBy?: string
  reviewedAt?: string
  ceoAlerted: boolean
  createdAt: string
}

export interface WorkerBudgetRequest {
  id: string
  siteId: string
  workerId: string
  workerName: string
  categoryId: string
  categoryName: string
  amountRequested: number
  amountApproved?: number
  currency: Currency
  reason: string
  status: BudgetRequestStatus
  reviewedBy?: string
  createdAt: string
}

export interface Expense {
  id: string
  siteId: string
  siteName: string
  projectId: string
  projectName: string
  submittedBy: string
  submittedByName: string
  categoryId: string
  categoryName: string
  amount: number
  currency: Currency
  amountUsd: number
  paymentMethod: PaymentMethod
  description: string
  receiptUrl?: string
  vendor?: string
  status: ExpenseStatus
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: string
  submittedAt: string
  version: number
}

export interface IncomeEntry {
  id: string
  projectId: string
  projectName: string
  amount: number
  currency: Currency
  date: string
  description: string
  status: 'received' | 'pending'
}

export interface RecurringAllocation {
  id: string
  siteId: string
  siteName: string
  workerId: string
  workerName: string
  categoryId: string
  categoryName: string
  amount: number
  currency: Currency
  frequency: 'monthly'
  status: 'active' | 'paused'
  effectiveFrom: string
  createdBy: string
}

export interface Notification {
  id: string
  type: 'budget_increase' | 'threshold' | 'account_request' | 'expense_approved' | 'expense_rejected' | 'budget_approved' | 'budget_adjusted' | 'new_request'
  title: string
  message: string
  read: boolean
  createdAt: string
  severity: 'info' | 'warning' | 'danger' | 'success'
}

export interface ApprovedBudget {
  categoryId: string
  categoryName: string
  approved: number
  spent: number
  currency: Currency
  status: 'active' | 'pending' | 'exhausted'
}

export interface DashboardStats {
  totalContractValue: number
  totalInvoiced: number
  totalSpent: number
  pendingApprovals: number
  projectCount: number
  siteCount: number
}

export interface MonthlyData {
  month: string
  income: number
  expenditure: number
}
