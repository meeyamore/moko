import { useEffect } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Topbar } from '../../components/layout/Topbar'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'

const SEVERITY_STYLES = {
  danger: { dot: 'bg-red-500', bg: 'bg-red-50 border-l-red-500' },
  warning: { dot: 'bg-amber-500', bg: 'bg-amber-50 border-l-amber-500' },
  success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-l-emerald-500' },
  info: { dot: 'bg-blue-500', bg: 'bg-blue-50 border-l-blue-500' },
}

export function NotificationsPage() {
  const { user } = useAuthStore()
  const { notifications, markNotificationsRead } = useAppStore()

  const userNotifs = user ? (notifications[user.id] || []) : []

  useEffect(() => {
    if (user) {
      setTimeout(() => markNotificationsRead(user.id), 1500)
    }
  }, [user])

  return (
    <AppLayout>
      <Topbar title="Notifications" subtitle={`${userNotifs.filter(n => !n.read).length} unread`} />

      <div className="max-w-2xl">
        {userNotifs.length === 0 ? (
          <div className="card-padded text-center py-10 text-neutral-400">No notifications</div>
        ) : (
          <div className="flex flex-col gap-2">
            {userNotifs.map(notif => {
              const style = SEVERITY_STYLES[notif.severity]
              return (
                <div
                  key={notif.id}
                  className={`rounded-lg border-l-4 p-4 border border-neutral-100 ${style.bg} ${!notif.read ? 'shadow-sm' : 'opacity-70'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm text-neutral-800">{notif.title}</div>
                        {!notif.read && <span className="badge badge-blue text-xs">New</span>}
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{notif.message}</p>
                      <div className="text-xs text-neutral-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
