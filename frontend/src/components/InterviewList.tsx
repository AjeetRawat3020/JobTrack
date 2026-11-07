
import { useCallback, useEffect, useState } from 'react'
import InterviewModal, {
  type InterviewFormData,
} from './InterviewModal'

type JobSummary = {
  id: number
  title: string
  company: string
}

export type Interview = {
  id: number
  interviewDate: string
  round: string
  notes: string
  status: string
  jobId: number
}

type InterviewListProps = {
  jobId: number
  token: string
  onClose: () => void
}

function toDateTimeLocal(date: string) {
  return date.length >= 16 ? date.slice(0, 16) : date
}

function InterviewList({ jobId, token, onClose }: InterviewListProps) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [jobDetails, setJobDetails] = useState<JobSummary | null>(null)
  const [jobDetailsLoading, setJobDetailsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [deletingInterview, setDeletingInterview] = useState<Interview | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')

  // Fetch the linked job so the schedule shows a meaningful title instead of its database ID.
  useEffect(() => {
    let isActive = true

    async function loadJobDetails() {
      try {
        const response = await fetch(`http://localhost:8080/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Could not load job details.')
        }

        const data: JobSummary = await response.json()
        if (isActive) setJobDetails(data)
      } catch {
        if (isActive) setJobDetails(null)
      }
    }

    setJobDetails(null)
    setJobDetailsLoading(true)
    void loadJobDetails().finally(() => {
      if (isActive) setJobDetailsLoading(false)
    })

    return () => {
      isActive = false
    }
  }, [jobId, token])

  const loadInterviews = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `http://localhost:8080/api/interviews/job/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 401 || response.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      if (!response.ok) throw new Error('Could not load interviews.')

      const data: Interview[] = await response.json()
      setInterviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [jobId, token])

  useEffect(() => {
    void loadInterviews()
  }, [loadInterviews])

  async function handleAddInterview(formData: InterviewFormData) {
    const response = await fetch(
      `http://localhost:8080/api/interviews/job/${jobId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    )

    if (response.status === 401 || response.status === 403) {
      throw new Error('Your session has expired. Please log in again.')
    }
    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to add interview.')
    }

    setShowAddForm(false)
    await loadInterviews()
  }

  async function handleUpdateInterview(formData: InterviewFormData) {
    if (!editingInterview) return

    const response = await fetch(
      `http://localhost:8080/api/interviews/${editingInterview.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    )

    if (response.status === 401 || response.status === 403) {
      throw new Error('Your session has expired. Please log in again.')
    }
    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to update interview.')
    }

    setEditingInterview(null)
    await loadInterviews()
  }

  async function confirmDeleteInterview() {
    if (!deletingInterview) return

    try {
      setDeletingId(deletingInterview.id)
      setActionError('')

      const response = await fetch(
        `http://localhost:8080/api/interviews/${deletingInterview.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.status === 401 || response.status === 403) {
        throw new Error('Your session has expired. Please log in again.')
      }
      if (!response.ok) throw new Error('Failed to delete interview.')

      setDeletingInterview(null)
      await loadInterviews()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not delete interview.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  function formatInterviewDate(date: string) {
    const parsedDate = new Date(date)
    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleString()
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Interview Schedule</h3>
          <p className="mt-1 text-sm text-slate-500">
            {jobDetails
              ? `${jobDetails.company} — ${jobDetails.title}`
              : jobDetailsLoading
                ? 'Loading job details...'
                : 'Job details unavailable'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + Add Interview
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>

      {showAddForm && (
        <InterviewModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddInterview}
        />
      )}

      {editingInterview && (
        <InterviewModal
          isEditing
          initialData={{
            interviewDate: toDateTimeLocal(editingInterview.interviewDate),
            round: editingInterview.round,
            notes: editingInterview.notes ?? '',
            status: (['Scheduled', 'Completed', 'Passed', 'Failed'].includes(editingInterview.status)
              ? editingInterview.status
              : 'Scheduled') as InterviewFormData['status'],
          }}
          onClose={() => setEditingInterview(null)}
          onSubmit={handleUpdateInterview}
        />
      )}

      {deletingInterview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && deletingId === null) {
              setDeletingInterview(null)
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-interview-title"
            aria-describedby="delete-interview-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </div>

            <h4 id="delete-interview-title" className="text-lg font-bold text-slate-900">
              Delete interview?
            </h4>
            <p id="delete-interview-description" className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete <strong>{deletingInterview.round}</strong>?
              This action cannot be undone.
            </p>

            {actionError && (
              <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeletingInterview(null)
                  setActionError('')
                }}
                disabled={deletingId !== null}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteInterview()}
                disabled={deletingId !== null}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId !== null ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionError && !deletingInterview && (
        <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      )}

      {loading && (
        <p className="py-8 text-center text-sm text-slate-500">Loading interviews...</p>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <button
            type="button"
            onClick={() => void loadInterviews()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && interviews.length === 0 && (
        <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
          <p className="text-base font-semibold text-slate-700">No interviews scheduled yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Click “Add Interview” to schedule your first interview.
          </p>
        </div>
      )}

      {!loading && !error && interviews.length > 0 && (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <article
              key={interview.id}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-slate-50/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{interview.round}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatInterviewDate(interview.interviewDate)}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {interview.status}
                </span>
              </div>

              {interview.notes && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {interview.notes}
                </p>
              )}

              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingInterview(interview)}
                  disabled={deletingId !== null}
                  className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionError('')
                    setDeletingInterview(interview)
                  }}
                  disabled={deletingId !== null}
                  className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default InterviewList

