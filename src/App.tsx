import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'

import { DashboardPage } from './features/dashboard/DashboardPage'
import { ExpenditurePage } from './features/analytics/ExpenditurePage'
import { IncomePage } from './features/analytics/IncomePage'

import { BudgetRequestsPage } from './features/budgets/BudgetRequestsPage'
import { BudgetsPage } from './features/budgets/BudgetsPage'
import { SiteManagerBudgetRequestPage } from './features/budgets/SiteManagerBudgetRequestPage'

import { RecurringPage } from './features/recurring/RecurringPage'
import { CategoriesPage } from './features/categories/CategoriesPage'
import { UsersPage } from './features/users/UsersPage'
import { NotificationsPage } from './features/users/NotificationsPage'

import { SiteManagerHomePage } from './features/expenses/SiteManagerHomePage'
import { SubmitExpensePage } from './features/expenses/SubmitExpensePage'
import { ApproveExpensesPage } from './features/expenses/ApproveExpensesPage'
import { WorkerRequestsPage } from './features/expenses/WorkerRequestsPage'
import { WorkerHomePage } from './features/expenses/WorkerHomePage'
import { WorkerRequestFundsPage } from './features/expenses/WorkerRequestFundsPage'

function RootRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ceo' || user.role === 'manager') return <Navigate to="/dashboard" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            border: '0.5px solid #E5E5E3',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ceo', 'manager']}><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/income" element={
          <ProtectedRoute allowedRoles={['ceo', 'manager']}><IncomePage /></ProtectedRoute>
        } />
        <Route path="/expenditure" element={
          <ProtectedRoute allowedRoles={['ceo', 'manager']}><ExpenditurePage /></ProtectedRoute>
        } />
        <Route path="/budgets" element={
          <ProtectedRoute allowedRoles={['ceo']}><BudgetsPage /></ProtectedRoute>
        } />
        <Route path="/budget-requests" element={
          <ProtectedRoute allowedRoles={['manager']}><BudgetRequestsPage /></ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute allowedRoles={['manager']}><ApproveExpensesPage /></ProtectedRoute>
        } />
        <Route path="/recurring" element={
          <ProtectedRoute allowedRoles={['ceo', 'manager', 'site_manager']}><RecurringPage /></ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute allowedRoles={['ceo', 'manager']}><CategoriesPage /></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['ceo']}><UsersPage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={['site_manager', 'site_worker']}>
            <HomeDispatch />
          </ProtectedRoute>
        } />
        <Route path="/budget-request" element={
          <ProtectedRoute allowedRoles={['site_manager']}><SiteManagerBudgetRequestPage /></ProtectedRoute>
        } />
        <Route path="/worker-requests" element={
          <ProtectedRoute allowedRoles={['site_manager']}><WorkerRequestsPage /></ProtectedRoute>
        } />
        <Route path="/my-expenses" element={
          <ProtectedRoute allowedRoles={['site_manager']}><SubmitExpensePage /></ProtectedRoute>
        } />
        <Route path="/approve-expenses" element={
          <ProtectedRoute allowedRoles={['site_manager']}><ApproveExpensesPage /></ProtectedRoute>
        } />
        <Route path="/request-funds" element={
          <ProtectedRoute allowedRoles={['site_worker']}><WorkerRequestFundsPage /></ProtectedRoute>
        } />
        <Route path="/submit-receipt" element={
          <ProtectedRoute allowedRoles={['site_worker', 'site_manager']}><SubmitExpensePage /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute allowedRoles={['site_worker']}><WorkerHomePage /></ProtectedRoute>
        } />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

function HomeDispatch() {
  const { user } = useAuthStore()
  if (!user) return null
  return user.role === 'site_manager' ? <SiteManagerHomePage /> : <WorkerHomePage />
}
