
import { useCallback, useEffect, useRef, useState } from 'react'

type NotificationItem = {
  id: number
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
}

type NotificationBellProps = {
  token: string
  onSessionExpired: () => void
}

const API_URL = 'http://localhost:8080/api/notifications'

function NotificationBell({ token, onSessionExpired }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  // Bell aur dropdown dono ko ek wrapper mein track karenge
  const notificationRef = useRef<HTMLDivElement>(null)

  const handleResponseError = (status: number) => {
    if (status === 401 || status === 403) {
      onSessionExpired()
      return true
    }
    return false
  }

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (handleResponseError(response.status)) return

      if (!response.ok) {
        throw new Error('Could not load unread notifications.')
      }

      const data: { unreadCount: number } = await response.json()
      setUnreadCount(data.unreadCount ?? 0)
    } catch (err) {
      console.error('Notification count error:', err)
    }
  }, [token])

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (handleResponseError(response.status)) return

      if (!response.ok) {
        throw new Error('Could not load notifications.')
      }

      const data: NotificationItem[] = await response.json()

      setNotifications(data)
      setUnreadCount(data.filter((item) => !item.read).length)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadUnreadCount()

    const intervalId = window.setInterval(() => {
      void loadUnreadCount()
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [loadUnreadCount])

  // Click outside karne par notification dropdown close hoga
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  async function markAsRead(id: number) {
    setBusyId(id)

    try {
      const response = await fetch(`${API_URL}/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (handleResponseError(response.status)) return

      if (!response.ok) {
        throw new Error('Could not mark notification as read.')
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      )

      setUnreadCount((count) => Math.max(0, count - 1))

      // Notification read hone ke baad dropdown close karo
      setIsOpen(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update notification.'
      )
    } finally {
      setBusyId(null)
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true)

    try {
      const response = await fetch(`${API_URL}/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (handleResponseError(response.status)) return

      if (!response.ok) {
        throw new Error('Could not mark all notifications as read.')
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      )

      setUnreadCount(0)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update notifications.'
      )
    } finally {
      setMarkingAll(false)
    }
  }

  async function deleteNotification(id: number) {
    setBusyId(id)

    const target = notifications.find((item) => item.id === id)

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (handleResponseError(response.status)) return

      if (!response.ok) {
        throw new Error('Could not delete notification.')
      }

      setNotifications((current) =>
        current.filter((item) => item.id !== id)
      )

      if (target && !target.read) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not delete notification.'
      )
    } finally {
      setBusyId(null)
    }
  }

  function formatDate(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div ref={notificationRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen
          setIsOpen(nextOpen)

          if (nextOpen) {
            void loadNotifications()
          }
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 transition hover:bg-slate-50"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <span aria-hidden="true">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          className="absolute left-0 right-auto z-50 mt-3 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:left-auto sm:right-0"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="font-semibold text-slate-800">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={unreadCount === 0 || markingAll}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? 'Updating...' : 'Mark all read'}
            </button>
          </div>

          {error && (
            <p className="px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="max-h-[min(65vh,440px)] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                You are all caught up. No notifications yet.
              </p>
            ) : (
              notifications.map((item) => (
                <article
                  key={item.id}
                  className={`border-b border-slate-100 px-4 py-3 last:border-b-0 ${
                    item.read ? 'bg-white' : 'bg-indigo-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        item.read ? 'bg-slate-300' : 'bg-indigo-600'
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-600">
                        {item.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3">
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => void markAsRead(item.id)}
                            disabled={busyId === item.id}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                          >
                            Mark as read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void deleteNotification(item.id)}
                          disabled={busyId === item.id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default NotificationBell
