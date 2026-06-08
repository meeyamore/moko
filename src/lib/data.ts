import type {
  User, Project, Site, ExpenseCategory, BudgetRequest,
  WorkerBudgetRequest, Expense, IncomeEntry, RecurringAllocation,
  Notification, ApprovedBudget
} from '../types'

export const USERS: User[] = [
  { id: 'u1', name: 'João Machava', email: 'ceo@voltrak.com', role: 'ceo', avatar: 'JM' },
  { id: 'u2', name: 'Carlos Nhantumbo', email: 'manager@voltrak.com', role: 'manager', avatar: 'CN', projectIds: ['p1', 'p2'] },
  { id: 'u3', name: 'Ahmed Salim', email: 'sitemanager@voltrak.com', role: 'site_manager', avatar: 'AS', siteIds: ['s1'] },
  { id: 'u4', name: 'Precious Dlamini', email: 'worker@voltrak.com', role: 'site_worker', avatar: 'PD', siteIds: ['s1'] },
  { id: 'u5', name: 'Bongani Khumalo', email: 'bongani@voltrak.com', role: 'site_worker', avatar: 'BK', siteIds: ['s2'] },
  { id: 'u6', name: 'Maria Langa', email: 'maria@voltrak.com', role: 'site_worker', avatar: 'ML', siteIds: ['s3'] },
  { id: 'u7', name: 'Themba Moyo', email: 'themba@voltrak.com', role: 'site_worker', avatar: 'TM', siteIds: [] },
]

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Maputo', country: 'Mozambique', location: 'Maputo', status: 'active', contractValue: 120000, contractCurrency: 'USD', startDate: '2025-01-10', expectedEndDate: '2025-08-30', managerIds: ['u2'], siteIds: ['s1', 's2'] },
  { id: 'p2', name: 'Xai Xai', country: 'Mozambique', location: 'Gaza Province', status: 'active', contractValue: 94000, contractCurrency: 'USD', startDate: '2025-03-01', expectedEndDate: '2025-10-15', managerIds: ['u2'], siteIds: ['s3'] },
  { id: 'p3', name: 'Durban', country: 'South Africa', location: 'KwaZulu-Natal', status: 'active', contractValue: 70000, contractCurrency: 'USD', startDate: '2025-04-01', expectedEndDate: '2025-11-30', managerIds: [], siteIds: ['s4', 's5'] },
]

export const SITES: Site[] = [
  { id: 's1', projectId: 'p1', name: 'Matola', location: 'Matola Industrial Zone', status: 'active', siteManagerIds: ['u3'], workerIds: ['u4', 'u5'] },
  { id: 's2', projectId: 'p1', name: 'Beira', location: 'Beira Port Area', status: 'active', siteManagerIds: [], workerIds: ['u5'] },
  { id: 's3', projectId: 'p2', name: 'Xai Xai Main', location: 'Xai Xai Industrial', status: 'active', siteManagerIds: [], workerIds: ['u6'] },
  { id: 's4', projectId: 'p3', name: 'Durban A', location: 'Durban Port', status: 'active', siteManagerIds: [], workerIds: [] },
  { id: 's5', projectId: 'p3', name: 'Durban B', location: 'Pinetown', status: 'active', siteManagerIds: [], workerIds: [] },
]

export const CATEGORIES: ExpenseCategory[] = [
  { id: 'c1', name: 'Transport', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 34 },
  { id: 'c2', name: 'Consumables', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 18 },
  { id: 'c3', name: 'Equipment rent', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 8 },
  { id: 'c4', name: 'Equipment maintenance', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 6 },
  { id: 'c5', name: 'Vehicles', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 4 },
  { id: 'c6', name: 'Personal', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 2 },
  { id: 'c7', name: 'Other', isActive: true, isRecurring: false, createdBy: 'u1', usageCount: 3 },
  { id: 'c8', name: 'Salary', isActive: true, isRecurring: true, createdBy: 'u1', usageCount: 12 },
  { id: 'c9', name: 'House rent', isActive: true, isRecurring: true, createdBy: 'u1', usageCount: 5 },
  { id: 'c10', name: 'Site misc', isActive: false, isRecurring: false, createdBy: 'u2', usageCount: 1 },
]

export const BUDGET_REQUESTS: BudgetRequest[] = [
  {
    id: 'br1',
    siteId: 's1', siteName: 'Matola', projectName: 'Maputo',
    requestedBy: 'u3', requestedByName: 'Ahmed Salim',
    reason: 'Phase 2 start — accommodation, generator service, and site supplies.',
    items: [
      { id: 'bi1', categoryId: 'c1', categoryName: 'Transport', amountRequested: 100, amountApproved: 100, currency: 'USD', status: 'approved' },
      { id: 'bi2', categoryId: 'c2', categoryName: 'Consumables', amountRequested: 50, amountApproved: 30, currency: 'USD', status: 'adjusted' },
      { id: 'bi3', categoryId: 'c4', categoryName: 'Equipment maintenance', amountRequested: 50, amountApproved: 50, currency: 'USD', status: 'approved' },
    ],
    totalRequested: 200, totalApproved: 180,
    status: 'pending', ceoAlerted: false,
    createdAt: '2025-05-28T08:10:00Z',
  },
  {
    id: 'br2',
    siteId: 's2', siteName: 'Beira', projectName: 'Maputo',
    requestedBy: 'u4', requestedByName: 'Precious Dlamini',
    reason: 'Tools and transport for week 3 works.',
    items: [
      { id: 'bi4', categoryId: 'c1', categoryName: 'Transport', amountRequested: 150, currency: 'USD', status: 'pending' },
      { id: 'bi5', categoryId: 'c2', categoryName: 'Consumables', amountRequested: 100, currency: 'USD', status: 'pending' },
    ],
    totalRequested: 250,
    status: 'pending', ceoAlerted: false,
    createdAt: '2025-05-27T14:30:00Z',
  },
]

export const WORKER_BUDGET_REQUESTS: WorkerBudgetRequest[] = [
  { id: 'wbr1', siteId: 's1', workerId: 'u4', workerName: 'Precious Dlamini', categoryId: 'c1', categoryName: 'Transport', amountRequested: 120, currency: 'USD', reason: 'Taxi fare to transformer site — 3 days', status: 'pending', createdAt: '2025-05-28T07:30:00Z' },
  { id: 'wbr2', siteId: 's1', workerId: 'u5', workerName: 'Bongani Khumalo', categoryId: 'c2', categoryName: 'Consumables', amountRequested: 45, currency: 'USD', reason: 'Safety gloves, cable ties, tape for installation work', status: 'pending', createdAt: '2025-05-27T09:15:00Z' },
  { id: 'wbr3', siteId: 's1', workerId: 'u4', workerName: 'Precious Dlamini', categoryId: 'c2', categoryName: 'Consumables', amountRequested: 45, amountApproved: 45, currency: 'USD', reason: 'Gloves and cable ties', status: 'approved', reviewedBy: 'u3', createdAt: '2025-05-20T10:00:00Z' },
]

export const EXPENSES: Expense[] = [
  { id: 'e1', siteId: 's1', siteName: 'Matola', projectId: 'p1', projectName: 'Maputo', submittedBy: 'u3', submittedByName: 'Ahmed Salim', categoryId: 'c1', categoryName: 'Transport', amount: 2450, currency: 'MZN', amountUsd: 38.58, paymentMethod: 'cash', description: 'Fuel — Petrogal Maputo', vendor: 'Petrogal Maputo', status: 'pending', submittedAt: '2025-05-28T14:32:00Z', version: 1 },
  { id: 'e2', siteId: 's2', siteName: 'Beira', projectId: 'p1', projectName: 'Maputo', submittedBy: 'u4', submittedByName: 'Precious Dlamini', categoryId: 'c2', categoryName: 'Consumables', amount: 88, currency: 'USD', amountUsd: 88, paymentMethod: 'card', description: 'Site supplies — Shoprite', vendor: 'Shoprite', status: 'approved', approvedBy: 'u3', approvedAt: '2025-05-27T10:22:00Z', submittedAt: '2025-05-27T08:00:00Z', version: 1 },
  { id: 'e3', siteId: 's1', siteName: 'Matola', projectId: 'p1', projectName: 'Maputo', submittedBy: 'u3', submittedByName: 'Ahmed Salim', categoryId: 'c9', categoryName: 'House rent', amount: 300, currency: 'USD', amountUsd: 300, paymentMethod: 'eft', description: 'Monthly house rent — May', status: 'approved', approvedBy: 'u2', approvedAt: '2025-05-22T09:00:00Z', submittedAt: '2025-05-22T08:00:00Z', version: 1 },
  { id: 'e4', siteId: 's4', siteName: 'Durban A', projectId: 'p3', projectName: 'Durban', submittedBy: 'u5', submittedByName: 'Bongani Khumalo', categoryId: 'c3', categoryName: 'Equipment rent', amount: 2100, currency: 'USD', amountUsd: 2100, paymentMethod: 'eft', description: 'Generator rental', status: 'approved', approvedBy: 'u2', approvedAt: '2025-05-26T09:00:00Z', submittedAt: '2025-05-26T08:00:00Z', version: 1 },
  { id: 'e5', siteId: 's1', siteName: 'Matola', projectId: 'p1', projectName: 'Maputo', submittedBy: 'u3', submittedByName: 'Ahmed Salim', categoryId: 'c8', categoryName: 'Salary', amount: 800, currency: 'USD', amountUsd: 800, paymentMethod: 'eft', description: 'May salary', status: 'approved', approvedBy: 'u2', approvedAt: '2025-05-25T09:00:00Z', submittedAt: '2025-05-25T08:00:00Z', version: 1 },
  { id: 'e6', siteId: 's1', siteName: 'Matola', projectId: 'p1', projectName: 'Maputo', submittedBy: 'u4', submittedByName: 'Precious Dlamini', categoryId: 'c2', categoryName: 'Consumables', amount: 32, currency: 'USD', amountUsd: 32, paymentMethod: 'cash', description: 'Tools', status: 'rejected', rejectionReason: 'Receipt image is unclear. Please resubmit with a legible receipt.', submittedAt: '2025-05-22T11:00:00Z', version: 1 },
]

export const INCOME_ENTRIES: IncomeEntry[] = [
  { id: 'i1', projectId: 'p1', projectName: 'Maputo', amount: 60000, currency: 'USD', date: '2025-01-15', description: 'Initial advance — 50%', status: 'received' },
  { id: 'i2', projectId: 'p1', projectName: 'Maputo', amount: 36000, currency: 'USD', date: '2025-03-10', description: 'Milestone 2 payment', status: 'received' },
  { id: 'i3', projectId: 'p1', projectName: 'Maputo', amount: 36000, currency: 'USD', date: '2025-05-15', description: 'Milestone 3 payment', status: 'received' },
  { id: 'i4', projectId: 'p2', projectName: 'Xai Xai', amount: 47000, currency: 'USD', date: '2025-03-01', description: 'Initial advance', status: 'received' },
  { id: 'i5', projectId: 'p3', projectName: 'Durban', amount: 35000, currency: 'USD', date: '2025-04-15', description: 'Initial advance', status: 'received' },
]

export const RECURRING_ALLOCATIONS: RecurringAllocation[] = [
  { id: 'ra1', siteId: 's1', siteName: 'Matola', workerId: 'u3', workerName: 'Ahmed Salim', categoryId: 'c8', categoryName: 'Salary', amount: 800, currency: 'USD', frequency: 'monthly', status: 'active', effectiveFrom: '2025-01-01', createdBy: 'u2' },
  { id: 'ra2', siteId: 's1', siteName: 'Matola', workerId: 'u3', workerName: 'Ahmed Salim', categoryId: 'c9', categoryName: 'House rent', amount: 300, currency: 'USD', frequency: 'monthly', status: 'active', effectiveFrom: '2025-01-01', createdBy: 'u2' },
  { id: 'ra3', siteId: 's1', siteName: 'Matola', workerId: 'u4', workerName: 'Precious Dlamini', categoryId: 'c8', categoryName: 'Salary', amount: 600, currency: 'USD', frequency: 'monthly', status: 'active', effectiveFrom: '2025-01-01', createdBy: 'u3' },
  { id: 'ra4', siteId: 's1', siteName: 'Matola', workerId: 'u4', workerName: 'Precious Dlamini', categoryId: 'c9', categoryName: 'House rent', amount: 250, currency: 'USD', frequency: 'monthly', status: 'active', effectiveFrom: '2025-03-01', createdBy: 'u3' },
  { id: 'ra5', siteId: 's1', siteName: 'Matola', workerId: 'u5', workerName: 'Bongani Khumalo', categoryId: 'c8', categoryName: 'Salary', amount: 600, currency: 'USD', frequency: 'monthly', status: 'active', effectiveFrom: '2025-01-01', createdBy: 'u3' },
]

export const NOTIFICATIONS: Record<string, Notification[]> = {
  u1: [
    { id: 'n1', type: 'budget_increase', title: 'Budget increase alert', message: "Carlos N. approved Ahmed Salim's house rent at $120 — above the $100 requested. Maputo / Matola site.", read: false, createdAt: '2025-05-28T09:15:00Z', severity: 'warning' },
    { id: 'n2', type: 'threshold', title: 'Budget threshold — 76%', message: 'Maputo project has reached 76% of its $120,000 contract value.', read: false, createdAt: '2025-05-28T08:40:00Z', severity: 'warning' },
    { id: 'n3', type: 'account_request', title: 'New account request', message: 'Themba Moyo requested access as a site worker. Pending your approval.', read: false, createdAt: '2025-05-27T16:22:00Z', severity: 'info' },
  ],
  u2: [
    { id: 'n4', type: 'new_request', title: 'New budget request', message: 'Ahmed Salim submitted a $200 budget request for Matola site.', read: false, createdAt: '2025-05-28T08:10:00Z', severity: 'info' },
    { id: 'n5', type: 'new_request', title: 'Expense submitted', message: 'Ahmed Salim submitted a $340 transport expense for your approval.', read: true, createdAt: '2025-05-28T07:55:00Z', severity: 'info' },
  ],
  u3: [
    { id: 'n6', type: 'budget_adjusted', title: 'Budget request adjusted', message: 'Carlos N. approved your request. Transport $100 approved. Consumables reduced to $30.', read: false, createdAt: '2025-05-28T09:20:00Z', severity: 'success' },
    { id: 'n7', type: 'new_request', title: 'New worker expense', message: 'Precious Dlamini submitted a $120 transport receipt for your approval.', read: false, createdAt: '2025-05-28T07:40:00Z', severity: 'info' },
  ],
  u4: [
    { id: 'n8', type: 'expense_rejected', title: 'Receipt rejected', message: 'Consumables ($32) rejected by Ahmed Salim — receipt image unclear. Please resubmit.', read: false, createdAt: '2025-05-22T14:10:00Z', severity: 'danger' },
    { id: 'n9', type: 'budget_approved', title: 'Funds approved', message: 'Ahmed Salim approved $45 for consumables. You can now submit receipts against this allocation.', read: true, createdAt: '2025-05-27T10:05:00Z', severity: 'success' },
  ],
}

export const APPROVED_BUDGETS: Record<string, ApprovedBudget[]> = {
  u3: [
    { categoryId: 'c1', categoryName: 'Transport', approved: 100, spent: 38.58, currency: 'USD', status: 'active' },
    { categoryId: 'c4', categoryName: 'Equipment maintenance', approved: 50, spent: 0, currency: 'USD', status: 'active' },
    { categoryId: 'c2', categoryName: 'Consumables', approved: 30, spent: 0, currency: 'USD', status: 'active' },
  ],
  u4: [
    { categoryId: 'c1', categoryName: 'Transport', approved: 200, spent: 88, currency: 'USD', status: 'active' },
    { categoryId: 'c2', categoryName: 'Consumables', approved: 100, spent: 45, currency: 'USD', status: 'active' },
  ],
}

export const MONTHLY_DATA = [
  { month: 'Jan', income: 60000, expenditure: 28400 },
  { month: 'Feb', income: 0, expenditure: 25100 },
  { month: 'Mar', income: 83000, expenditure: 31200 },
  { month: 'Apr', income: 35000, expenditure: 27520 },
  { month: 'May', income: 0, expenditure: 51200 },
]

export const CATEGORY_SPEND = [
  { name: 'Salary', amount: 30000, color: '#7F77DD' },
  { name: 'Transport', amount: 24100, color: '#378ADD' },
  { name: 'Equipment rent', amount: 20200, color: '#1D9E75' },
  { name: 'House rent', amount: 13400, color: '#D85A30' },
  { name: 'Consumables', amount: 9200, color: '#BA7517' },
  { name: 'Equip. maint.', amount: 6520, color: '#639922' },
  { name: 'Vehicles', amount: 3800, color: '#7F77DD' },
  { name: 'Other', amount: 2600, color: '#888780' },
]

export const SITE_SPEND = [
  { name: 'Matola (Maputo)', amount: 51200, color: '#185FA5' },
  { name: 'Beira (Maputo)', amount: 40000, color: '#185FA5' },
  { name: 'Xai Xai', amount: 39480, color: '#0C447C' },
  { name: 'Durban A', amount: 19800, color: '#0C447C' },
  { name: 'Durban B', amount: 12940, color: '#378ADD' },
]

export const RATES: Record<string, number> = { USD: 1, MZN: 63.5, ZAR: 18.2, KRW: 1340 }
export const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', MZN: 'MT ', ZAR: 'R', KRW: '₩' }

export function formatCurrency(amount: number, currency = 'USD'): string {
  const sym = CURRENCY_SYMBOLS[currency] || '$'
  const converted = Math.round(amount * (RATES[currency] || 1))
  return sym + converted.toLocaleString()
}
