import { useCallback, useEffect, useMemo, useState } from 'react'
import InterviewModal, { type InterviewFormData } from './InterviewModal'

type JobSummary = {
  id: number
  title: string
  company: string
}

type Interview = {
  id: number
  interviewDate: string
  round: string
  notes: string
  status: 'Scheduled' | 'Completed' | 'Passed' | 'Failed'
  jobId: number
}

type AllInterview = Interview & {
  jobTitle: string
  company: string
}

type Props = {
  token: string
  onSessionExpired: () => void
}

type ViewMode = 'list' | 'calendar'

const API_URL = 'http://localhost:8080/api'

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
}

// Uses the date portion returned by the backend, avoiding UTC date shifts.
function getDateKey(value: string) {
  return value?.slice(0, 10) ?? ''
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatSelectedDate(dateKey: string) {
  if (!dateKey) return ''
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function AllInterviews({ token, onSessionExpired }: Props) {
  const [interviews, setInterviews] = useState<AllInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingInterview, setEditingInterview] = useState<AllInterview | null>(null)
  const [deletingInterview, setDeletingInterview] = useState<AllInterview | null>(null)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState('')

  const loadInterviews = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const jobs: JobSummary[] = []
      let page = 0
      let totalPages = 1

      while (page < totalPages) {
        const jobsResponse = await fetch(
          `${API_URL}/jobs?page=${page}&size=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (jobsResponse.status === 401 || jobsResponse.status === 403) {
          onSessionExpired()
          return
        }
        if (!jobsResponse.ok) throw new Error('Could not load your applications.')

        const pageData = await jobsResponse.json()
        jobs.push(...(pageData.content ?? []))
        totalPages = pageData.totalPages ?? 1
        page += 1
      }

      const results = await Promise.all(
        jobs.map(async (job) => {
          const response = await fetch(
            `${API_URL}/interviews/job/${job.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (response.status === 401 || response.status === 403) {
            onSessionExpired()
            throw new Error('Your session has expired. Please log in again.')
          }
          if (!response.ok) throw new Error(`Could not load interviews for ${job.company}.`)

          const jobInterviews: Interview[] = await response.json()
          return jobInterviews.map((interview) => ({
            ...interview,
            jobTitle: job.title,
            company: job.company,
          }))
        })
      )

      const combined = results.flat().sort(
        (a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
      )
      setInterviews(combined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load interviews.')
    } finally {
      setLoading(false)
    }
  }, [token, onSessionExpired])

  useEffect(() => {
    void loadInterviews()
  }, [loadInterviews])

  const interviewsByDate = useMemo(() => {
    const grouped: Record<string, AllInterview[]> = {}
    interviews.forEach((interview) => {
      const key = getDateKey(interview.interviewDate)
      if (!key) return
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(interview)
    })
    return grouped
  }, [interviews])

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // Monday-first calendar: Monday = 0, Sunday = 6.
    const leadingBlanks = (firstDay.getDay() + 6) % 7
    const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - leadingBlanks + 1
      if (dayNumber < 1 || dayNumber > daysInMonth) return null
      const date = new Date(year, month, dayNumber)
      return {
        date,
        key: toDateKey(date),
        dayNumber,
      }
    })
  }, [visibleMonth])

  const selectedDayInterviews = selectedDate ? interviewsByDate[selectedDate] ?? [] : []

  function changeMonth(amount: number) {
    setVisibleMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + amount, 1)
    )
  }

  async function handleUpdate(data: InterviewFormData) {
    if (!editingInterview) return
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/interviews/${editingInterview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (response.status === 401 || response.status === 403) {
        onSessionExpired()
        throw new Error('Your session has expired. Please log in again.')
      }
      if (!response.ok) throw new Error('Could not update this interview.')
      setEditingInterview(null)
      await loadInterviews()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingInterview) return
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/interviews/${deletingInterview.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 401 || response.status === 403) {
        onSessionExpired()
        throw new Error('Your session has expired. Please log in again.')
      }
      if (!response.ok) throw new Error('Could not delete this interview.')
      setDeletingInterview(null)
      await loadInterviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this interview.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <section className="applications-section rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
              Interview Schedule
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All interviews from your job applications in one place.
            </p>
          </div>
          <button
            type="button"
            className="secondary-button rounded-lg px-4 py-2 text-sm font-medium"
            onClick={() => void loadInterviews()}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mb-5 inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            List View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            aria-pressed={viewMode === 'calendar'}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'calendar'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Calendar View
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading all interviews...</p>
        ) : viewMode === 'calendar' ? (
          <div className="space-y-5">
            <div className="mx-auto w-full max-w-[520px] rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="secondary-button h-9 w-9 rounded-lg text-sm"
                  aria-label="Previous month"
                >
                  ←
                </button>
                <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                  {visibleMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="secondary-button h-9 w-9 rounded-lg text-sm"
                  aria-label="Next month"
                >
                  →
                </button>
              </div>

              <div
                className="grid w-full grid-cols-7 gap-1 sm:gap-1.5"
                style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div
                    key={day}
                    className="py-1 text-center text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`blank-${index}`} className="aspect-square" />
                  }

                  const dayInterviews = interviewsByDate[day.key] ?? []
                  const isSelected = selectedDate === day.key
                  const isToday = toDateKey(new Date()) === day.key

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDate(day.key)}
                      aria-label={`${formatSelectedDate(day.key)}: ${dayInterviews.length} interviews`}
                      aria-pressed={isSelected}
                      className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-lg border text-xs transition sm:text-sm ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : isToday
                            ? 'border-indigo-200 bg-indigo-50/60 text-indigo-700'
                            : 'border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="leading-none">{day.dayNumber}</span>
                      {dayInterviews.length > 0 && (
                        <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-center text-[10px] text-slate-400">
                Select a date · Dot indicates an interview
              </p>
            </div>

            {selectedDate ? (
              <div>
                <h3 className="mb-3 text-base font-semibold text-slate-800">
                  {formatSelectedDate(selectedDate)}
                </h3>
                {selectedDayInterviews.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                    No interviews on this date.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayInterviews.map((interview) => (
                      <article
                        key={interview.id}
                        className="rounded-xl border border-slate-200 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-slate-800">{interview.company}</h4>
                            <p className="mt-1 text-sm text-slate-500">{interview.jobTitle}</p>
                          </div>
                          <span className={`status-badge status-${interview.status.toLowerCase()}`}>
                            {interview.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">{interview.round || 'Interview'}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatDate(interview.interviewDate)}</p>
                        <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                          <button
                            type="button"
                            className="secondary-button rounded-lg px-4 py-2 text-sm font-medium"
                            onClick={() => setEditingInterview(interview)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-button rounded-lg px-4 py-2 text-sm font-medium"
                            onClick={() => setDeletingInterview(interview)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">
                Choose a date on the calendar to view its interviews.
              </p>
            )}
          </div>
        ) : interviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center">
            <p className="font-semibold text-slate-700">No interviews scheduled yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add an interview from the Interviews button on any application.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {interviews.map((interview) => (
                <article
                  key={interview.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-semibold text-slate-800">
                        {interview.company}
                      </h3>
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {interview.jobTitle}
                      </p>
                    </div>
                    <span className={`status-badge status-${interview.status.toLowerCase()} shrink-0`}>
                      {interview.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Interview round
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {interview.round || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Date & time
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {formatDate(interview.interviewDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      className="secondary-button flex-1 rounded-lg px-3 py-2 text-sm font-medium"
                      onClick={() => setEditingInterview(interview)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button flex-1 rounded-lg px-3 py-2 text-sm font-medium"
                      onClick={() => setDeletingInterview(interview)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-xl border border-slate-100 sm:block">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {['Company / Position', 'Interview Round', 'Date & Time', 'Status', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <strong className="block text-sm font-semibold text-slate-800">{interview.company}</strong>
                        <span className="mt-1 block text-sm text-slate-500">{interview.jobTitle}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{interview.round || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(interview.interviewDate)}</td>
                      <td className="px-4 py-4">
                        <span className={`status-badge status-${interview.status.toLowerCase()}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="secondary-button rounded-lg px-3 py-2 text-sm font-medium"
                            onClick={() => setEditingInterview(interview)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-button rounded-lg px-3 py-2 text-sm font-medium"
                            onClick={() => setDeletingInterview(interview)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {editingInterview && (
        <InterviewModal
          key={editingInterview.id}
          initialData={{
            interviewDate: editingInterview.interviewDate.slice(0, 16),
            round: editingInterview.round,
            notes: editingInterview.notes,
            status: editingInterview.status,
          }}
          isEditing
          onClose={() => setEditingInterview(null)}
          onSubmit={handleUpdate}
        />
      )}

      {deletingInterview && (
        <div className="modal-overlay" onClick={() => !saving && setDeletingInterview(null)}>
          <section
            className="application-modal delete-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-interview-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="all-interview-delete-title">Delete interview?</h2>
              <button type="button" onClick={() => setDeletingInterview(null)} disabled={saving} aria-label="Close confirmation">×</button>
            </div>
            <p>
              Delete <strong>{deletingInterview.round}</strong> at{' '}
              <strong>{deletingInterview.company}</strong>?
            </p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={() => setDeletingInterview(null)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="delete-button" onClick={() => void handleDelete()} disabled={saving}>
                {saving ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default AllInterviews
