import { useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

export function CategoriesPage() {
  const { user } = useAuthStore()
  const { categories, addCategory, toggleCategory } = useAppStore()
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const isCeo = user?.role === 'ceo'

  const handleAdd = () => {
    if (!newName.trim() || !user) return
    addCategory(newName.trim(), user.id)
    toast.success(`Category "${newName.trim()}" published`)
    setNewName('')
    setShowForm(false)
  }

  const handleToggle = (id: string, name: string, isActive: boolean) => {
    if (!isCeo && !isActive) { toast.error('Only the CEO can reactivate categories'); return }
    toggleCategory(id)
    toast.success(isActive ? `"${name}" deactivated` : `"${name}" reactivated`)
  }

  return (
    <AppLayout>
      <Topbar
        title="Categories"
        subtitle="Changes apply instantly across all dropdowns"
        actions={
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-xs py-1.5">+ New category</button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="alert-blue">
          <span>ℹ</span>
          <span>
            <strong>Ad hoc categories</strong> appear in budget request forms.
            <strong className="ml-2">Recurring only</strong> (Salary, House rent) are managed in the Recurring tab — not available for ad hoc requests.
            Deactivated categories are hidden from new submissions but preserved on historical records.
          </span>
        </div>

        {showForm && (
          <div className="card-padded">
            <div className="section-label mb-2">New category</div>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Category name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleAdd}>Save &amp; publish</button>
              <button className="btn" onClick={() => { setShowForm(false); setNewName('') }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 grid grid-cols-[1fr_120px_80px_120px] gap-3">
            <span className="text-xs font-medium text-neutral-500">Category name</span>
            <span className="text-xs font-medium text-neutral-500">Type</span>
            <span className="text-xs font-medium text-neutral-500">Usage</span>
            <span className="text-xs font-medium text-neutral-500">Action</span>
          </div>

          {categories.map(cat => (
            <div
              key={cat.id}
              className={`px-4 py-3 border-b border-neutral-50 last:border-0 grid grid-cols-[1fr_120px_80px_120px] gap-3 items-center ${!cat.isActive ? 'opacity-50' : ''}`}
            >
              <span className={`text-sm font-medium ${!cat.isActive ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                {cat.name}
              </span>
              <span>
                {cat.isRecurring
                  ? <span className="badge badge-purple">Recurring only</span>
                  : <span className="badge badge-gray">Ad hoc</span>
                }
              </span>
              <span className="text-xs text-neutral-500">{cat.usageCount} uses</span>
              <div>
                {cat.isRecurring ? (
                  <span className="text-xs text-neutral-400">Managed in Recurring</span>
                ) : (
                  <button
                    onClick={() => handleToggle(cat.id, cat.name, cat.isActive)}
                    className={`btn text-xs py-1 ${cat.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    {cat.isActive
                      ? (isCeo ? 'Deactivate' : 'Suggest off')
                      : (isCeo ? 'Reactivate' : '—')
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
