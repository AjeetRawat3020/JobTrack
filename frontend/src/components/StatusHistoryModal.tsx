import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8080/api'

type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

type StatusHistoryItem = {
  id: number
  previousStatus: ApplicationStatus | null
  newStatus: ApplicationStatus
  changedAt: string
  jobId: number
}

type StatusHistoryModalProps = {
  jobId: number
  jobTitle: string
  company: string
  token: string
  onClose: () => void
  onSessionExpired: () => void
}

function formatStatus(status: ApplicationStatus | null) {
  if (!status) return 'Application created'
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusHistoryModal({
  jobId,
  jobTitle,
  company,
  token,
  onClose,
  onSessionExpired,
}: StatusHistoryModalProps) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `${API_URL}/jobs/${jobId}/status-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.status === 401 || response.status === 403) {
          onSessionExpired()
          return
        }

        if (!response.ok) {
          throw new Error('Could not load application status history.')
        }

        const data: StatusHistoryItem[] = await response.json()
        if (!cancelled) setHistory(data)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong while loading history.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadHistory()

    return () => {
      cancelled = true
    }
  }, [jobId, token, onSessionExpired])

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <section
        className="application-modal !w-full !max-w-[520px] !max-h-[85vh] overflow-y-auto !p-5 sm:!p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Application timeline
            </p>
            <h2 id="status-history-title">Status History</h2>
            <p className="mt-1 text-sm text-slate-500">
              {jobTitle} · {company}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close status history"
          >
            ×
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="py-5 text-center text-sm text-slate-500">
              Loading status history...
            </p>
          ) : error ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-5 text-center">
              <p className="font-medium text-slate-700">
                No status history yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Status changes for this application will appear here.
              </p>
            </div>
          ) : (
            <ol className="relative ml-2 space-y-4 border-l-2 border-indigo-100 pl-6">
              {history.map((item, index) => (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100" />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                      {formatStatus(item.newStatus)}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Latest
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm text-slate-600">
                    {item.previousStatus
                      ? `Changed from ${formatStatus(item.previousStatus)}`
                      : 'Initial application status'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(item.changedAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="modal-actions mt-4">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  )
}

export default StatusHistoryModal
