import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8080/api'

type JobSummary = {
  id: number
  title: string
  company: string
}

type Interview = {
  id: number
  interviewDate: string
  round: string
  notes?: string
  status: string
  jobId: number
}

type UpcomingInterview = Interview & {
  jobTitle: string
  company: string
}

type UpcomingInterviewsProps = {
  token: string
  onSessionExpired: () => void
}

function UpcomingInterviews({
  token,
  onSessionExpired,
}: UpcomingInterviewsProps) {
  const [interviews, setInterviews] = useState<UpcomingInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingInterviewId, setUpdatingInterviewId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')

  async function markAsCompleted(interview: UpcomingInterview) {
    setUpdatingInterviewId(interview.id)
    setActionError('')

    try {
      const response = await fetch(
        `${API_URL}/interviews/${interview.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interviewDate: interview.interviewDate,
            round: interview.round,
            notes: interview.notes ?? '',
            status: 'Completed',
          }),
        }
      )

      if (response.status === 401 || response.status === 403) {
        onSessionExpired()
        return
      }

      if (!response.ok) {
        throw new Error('Could not update this interview. Please try again.')
      }

      // Completed interview upcoming reminder list se remove ho jayega.
      setInterviews((current) =>
        current.filter((item) => item.id !== interview.id)
      )
    } catch (updateError) {
      setActionError(
        updateError instanceof Error
          ? updateError.message
          : 'Could not update this interview.'
      )
    } finally {
      setUpdatingInterviewId(null)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadUpcomingInterviews() {
      setLoading(true)
      setError('')

      try {
        const jobs: JobSummary[] = []
        let page = 0
        let totalPages = 1

        // Saare job applications pages mein load karo.
        while (page < totalPages) {
          const jobsResponse = await fetch(
            `${API_URL}/jobs?page=${page}&size=100`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (jobsResponse.status === 401 || jobsResponse.status === 403) {
            onSessionExpired()
            return
          }

          if (!jobsResponse.ok) {
            throw new Error('Could not load your job applications.')
          }

          const jobsData = await jobsResponse.json()
          jobs.push(...(jobsData.content ?? []))
          totalPages = jobsData.totalPages ?? 1
          page += 1
        }

        // Har job ke interviews fetch karke company/job title attach karo.
        const interviewGroups = await Promise.all(
          jobs.map(async (job) => {
            const response = await fetch(
              `${API_URL}/interviews/job/${job.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.status === 401 || response.status === 403) {
              throw new Error('SESSION_EXPIRED')
            }

            if (!response.ok) {
              throw new Error(`Could not load interviews for ${job.company}.`)
            }

            const jobInterviews: Interview[] = await response.json()

            return jobInterviews.map((interview) => ({
              ...interview,
              jobTitle: job.title,
              company: job.company,
            }))
          })
        )

        const allInterviews = interviewGroups.flat()
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const lastDay = new Date(today)
        lastDay.setDate(today.getDate() + 7)

        const upcoming = allInterviews
          .filter((interview) => {
            const status = interview.status.toLowerCase()
            if (status !== 'scheduled') return false

            const interviewDate = new Date(interview.interviewDate)
            return !Number.isNaN(interviewDate.getTime()) &&
              interviewDate >= now &&
              interviewDate < lastDay
          })
          .sort(
            (a, b) =>
              new Date(a.interviewDate).getTime() -
              new Date(b.interviewDate).getTime()
          )

        if (!cancelled) setInterviews(upcoming)
      } catch (loadError) {
        if (loadError instanceof Error && loadError.message === 'SESSION_EXPIRED') {
          onSessionExpired()
          return
        }

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load upcoming interviews.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUpcomingInterviews()

    return () => {
      cancelled = true
    }
  }, [token])

  function formatInterviewDate(value: string) {
    const date = new Date(value)
    const now = new Date()
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()

    const dateLabel = isToday
      ? 'Today'
      : date.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })

    const timeLabel = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })

    return { dateLabel, timeLabel, isToday }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Upcoming Interviews
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your scheduled interviews for the next 7 days.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
          {interviews.length} upcoming
        </span>
      </div>

      {loading && (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Loading upcoming interviews...
        </p>
      )}

      {!loading && error && (
        <p className="rounded-xl bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {actionError && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {!loading && !error && interviews.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
          <p className="text-2xl">📅</p>
          <p className="mt-2 font-medium text-slate-700">
            No upcoming interviews
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Interviews scheduled in the next 7 days will appear here.
          </p>
        </div>
      )}

      {!loading && !error && interviews.length > 0 && (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const dateInfo = formatInterviewDate(interview.interviewDate)

            return (
              <article
                key={interview.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-800">
                      {interview.company}
                    </h3>
                    {dateInfo.isToday && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {interview.jobTitle}
                  </p>
                  <p className="mt-1 text-sm text-indigo-600">
                    {interview.round || 'Interview'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                  <div className="sm:text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {dateInfo.dateLabel}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {dateInfo.timeLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => markAsCompleted(interview)}
                    disabled={updatingInterviewId === interview.id}
                    className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {updatingInterviewId === interview.id
                      ? 'Updating...'
                      : 'Mark as Completed'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default UpcomingInterviews
