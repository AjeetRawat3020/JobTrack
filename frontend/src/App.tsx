import './App.css'
import { useEffect, useState } from 'react'
import StatCard from './components/StatCard'
import Sidebar from './components/Sidebar'
import AddApplicationModal, {
  type JobFormData,
  type JobStatus,
} from './components/AddApplicationModal'
import Login from './components/Login'
import Register from './components/Register'
import Pagination from './components/Pagination'
import InterviewList from './components/InterviewList'
import AllInterviews from './components/AllInterviews'
import UpcomingInterviews from './components/UpcomingInterviews'
import NotificationBell from './components/NotificationBell'
import StatusHistoryModal from './components/StatusHistoryModal'

type JobApplication = {
  id: number
  title: string
  company: string
  location: string
  appliedDate: string
  status: JobStatus
}

type DashboardStats = {
  totalApplications: number
  saved: number
  applied: number
  interview: number
  offer: number
  rejected: number
}

const API_URL = 'http://localhost:8080/api'

const EMPTY_STATS: DashboardStats = {
  totalApplications: 0,
  saved: 0,
  applied: 0,
  interview: 0,
  offer: 0,
  rejected: 0,
}

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 5

  const [activePage, setActivePage] = useState<'dashboard' | 'applications' | 'interviews'>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showAllJobs, setShowAllJobs] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [editingJobId, setEditingJobId] = useState<number | null>(null)
  const [editingFormData, setEditingFormData] =
    useState<JobFormData | null>(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deletingJob, setDeletingJob] = useState<JobApplication | null>(null)

  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem('token')
  )

  const [username, setUsername] = useState(
    sessionStorage.getItem('username') || ''
  )

  // Theme preference saved locally across refreshes.
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('jobtrack-theme') === 'dark' ? 'dark' : 'light'
  )

  useEffect(() => {
    localStorage.setItem('jobtrack-theme', theme)
  }, [theme])

const [selectedInterviewJob, setSelectedInterviewJob] =
  useState<number | null>(null)
const [selectedHistoryJob, setSelectedHistoryJob] =
  useState<JobApplication | null>(null)

  function handleLoginSuccess(
    newToken: string,
    loggedInUsername: string
  ) {
    sessionStorage.setItem('token', newToken)
    sessionStorage.setItem('username', loggedInUsername)

    setToken(newToken)
    setUsername(loggedInUsername)
    setShowRegister(false)
  }

  function handleLogout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')

    setToken(null)
    setUsername('')
    setJobs([])
    setStats(EMPTY_STATS)
    setShowRegister(false)
    setShowAddForm(false)
    setShowAllJobs(false)
    setEditingJobId(null)
    setEditingFormData(null)
    setSelectedInterviewJob(null)
    setSelectedHistoryJob(null)
    setActivePage('dashboard')
    setLoading(false)
  }

  // Jobs aur dashboard statistics ko backend se refresh karo.
  async function refreshDashboard() {
    if (!token) return

    const [jobsResponse, statsResponse] = await Promise.all([
      fetch(`${API_URL}/jobs?page=0&size=${PAGE_SIZE}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`${API_URL}/jobs/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ])

    if (
      jobsResponse.status === 401 ||
      jobsResponse.status === 403 ||
      statsResponse.status === 401 ||
      statsResponse.status === 403
    ) {
      handleLogout()
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!jobsResponse.ok || !statsResponse.ok) {
      throw new Error('Could not refresh dashboard data.')
    }

    const jobsData = await jobsResponse.json()
    const statsData = await statsResponse.json()

    setJobs(jobsData.content ?? [])
    setCurrentPage(jobsData.number ?? 0)
    setTotalPages(jobsData.totalPages ?? 0)
    setTotalElements(jobsData.totalElements ?? 0)
    setStats(statsData)
  }

// Job title, description ya company ke liye search karo.
async function handleSearch() {
  if (!token) return

  const params = new URLSearchParams({
    page: '0',
    size: '100',
  })

  if (searchTerm.trim()) {
    params.set('keyword', searchTerm.trim())
  }

  if (statusFilter !== 'ALL') {
    params.set('status', statusFilter)
  }

  try {
    setLoading(true)

    const response = await fetch(
      `${API_URL}/jobs/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.status === 401 || response.status === 403) {
      handleLogout()
      return
    }

    if (!response.ok) {
      throw new Error('Search failed. Please try again.')
    }

    const data = await response.json()
    setJobs(data.content ?? [])
    setShowAllJobs(true)
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : 'Could not search applications.'
    )
  } finally {
    setLoading(false)
  }
}

  // Backend se selected page ke jobs fetch karo; filters bhi preserve rahenge.
  async function loadJobsPage(page: number, keyword = searchTerm, status = statusFilter) {
    if (!token) return

    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) })
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (status !== 'ALL') params.set('status', status)

    const hasFilters = Boolean(keyword.trim()) || status !== 'ALL'
    const endpoint = hasFilters
      ? `${API_URL}/jobs/search?${params.toString()}`
      : `${API_URL}/jobs?${params.toString()}`

    try {
      setLoading(true)
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }
      if (!response.ok) throw new Error('Could not load applications.')

      const data = await response.json()
      setJobs(data.content ?? [])
      setCurrentPage(data.number ?? page)
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
      setShowAllJobs(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not load applications.')
    } finally {
      setLoading(false)
    }
  }

  // Search ya status badalne par first page se results dikhao.
  async function applyFilters(keyword: string, status: string) {
    setCurrentPage(0)
    await loadJobsPage(0, keyword, status)
  }

  // Login ke baad dashboard data load karo.
  useEffect(() => {
    if (!token) {
      setJobs([])
      setStats(EMPTY_STATS)
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadDashboard() {
      setLoading(true)

      try {
        const [jobsResponse, statsResponse] = await Promise.all([
          fetch(`${API_URL}/jobs?page=0&size=${PAGE_SIZE}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/jobs/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (
          jobsResponse.status === 401 ||
          jobsResponse.status === 403 ||
          statsResponse.status === 401 ||
          statsResponse.status === 403
        ) {
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('username')

          if (!cancelled) {
            setToken(null)
            setUsername('')
            setJobs([])
            setStats(EMPTY_STATS)
          }

          return
        }

        if (!jobsResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to load dashboard data.')
        }

        const jobsData = await jobsResponse.json()
        const statsData = await statsResponse.json()

        if (!cancelled) {
          setJobs(jobsData.content ?? [])
          setCurrentPage(jobsData.number ?? 0)
          setTotalPages(jobsData.totalPages ?? 0)
          setTotalElements(jobsData.totalElements ?? 0)
          setStats(statsData)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading dashboard:', error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [token])

  // Nayi application save karo.
  async function handleAddApplication(formData: JobFormData) {
    if (!token) {
      throw new Error('Please log in first.')
    }

    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })

    if (response.status === 401 || response.status === 403) {
      handleLogout()
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to save application.')
    }

    setShowAddForm(false)

    try {
      await refreshDashboard()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Application saved, but dashboard refresh failed.'
      )
    }
  }

  // Edit button par complete application details fetch karo.
  async function handleEditApplication(jobId: number) {
    if (!token) return

    setActionLoading(true)

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }

      if (!response.ok) {
        throw new Error('Could not load application details.')
      }

      const job = await response.json()

      setEditingJobId(jobId)
      setEditingFormData({
        title: job.title ?? '',
        company: job.company ?? '',
        location: job.location ?? '',
        jobType: job.jobType ?? '',
        description: job.description ?? '',
        status: job.status ?? 'SAVED',
        appliedDate: job.appliedDate ?? '',
        jobUrl: job.jobUrl ?? '',
        notes: job.notes ?? '',
      })
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Could not load application details.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  // Existing application update karo.
  async function handleUpdateApplication(formData: JobFormData) {
    if (!token || editingJobId === null) {
      throw new Error('No application selected for editing.')
    }

    const response = await fetch(`${API_URL}/jobs/${editingJobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    })

    if (response.status === 401 || response.status === 403) {
      handleLogout()
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Failed to update application.')
    }

    setEditingJobId(null)
    setEditingFormData(null)

    try {
      await refreshDashboard()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Application updated, but dashboard refresh failed.'
      )
    }
  }

  // Confirmation ke baad application delete karo.
  async function handleDeleteApplication(jobId: number) {
    if (!token) return

    setActionLoading(true)

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        handleLogout()
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to delete application.')
      }

      setDeletingJob(null)
      await refreshDashboard()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Could not delete application.'
      )
    } finally {
      setActionLoading(false)
    }
  }


  // Login aur Register screens.
  if (!token) {
    if (showRegister) {
      return (
        <Register
          onShowLogin={() => setShowRegister(false)}
        />
      )
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }


  return (
    <div className={`app ${mobileMenuOpen ? 'mobile-menu-open' : ''}`} data-theme={theme}>
      <Sidebar
        username={username}
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page)
          setMobileMenuOpen(false)
          setSelectedInterviewJob(null)
          setSelectedHistoryJob(null)
        }}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="dashboard-heading">
            <button
              type="button"
              className="mobile-menu-button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? '×' : '☰'}
            </button>
            <div>
              <p className="eyebrow">YOUR CAREER JOURNEY</p>
              <h1 className="text-3xl font-bold text-indigo-600">
                {activePage === 'dashboard'
                  ? 'Dashboard'
                  : activePage === 'applications'
                    ? 'My Applications'
                    : 'All Interviews'}
              </h1>
            </div>
          </div>

          <div className="topbar-actions !flex !flex-row !flex-nowrap items-center justify-end gap-2">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
              <span className="theme-toggle-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <NotificationBell token={token} onSessionExpired={handleLogout} />

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowAddForm(true)}
              hidden={activePage === 'interviews'}
            >
              + Add Application
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {activePage === 'dashboard' && (
        <>
        <section className="welcome">
          <div>
            <p className="welcome-label">YOUR PROGRESS, AT A GLANCE</p>
            <h2>Keep moving forward.</h2>
            <p>
              Every application brings you one step closer to your next
              opportunity.
            </p>
          </div>

          <div className="welcome-symbol">↗</div>
        </section>

        <section className="stats-grid" aria-label="Application statistics">
          <StatCard
            label="Total Applications"
            value={String(stats.totalApplications)}
            symbol="▤"
          />

          <StatCard
            label="Applied"
            value={String(stats.applied)}
            symbol="↗"
          />

          <StatCard
            label="Interviews"
            value={String(stats.interview)}
            symbol="◷"
          />

          <StatCard
            label="Offers"
            value={String(stats.offer)}
            symbol="★"
          />
        </section>

        <UpcomingInterviews
          token={token}
          onSessionExpired={handleLogout}
        />
        </>
        )}

        {showAddForm && (
          <AddApplicationModal
            onClose={() => setShowAddForm(false)}
            onSubmit={handleAddApplication}
          />
        )}

        {editingFormData && editingJobId !== null && (
          <AddApplicationModal
            key={editingJobId}
            initialData={editingFormData}
            isEditing
            onClose={() => {
              setEditingJobId(null)
              setEditingFormData(null)
            }}
            onSubmit={handleUpdateApplication}
          />
        )}

        {deletingJob && (
          <div
            className="modal-overlay"
            onClick={() => {
              if (!actionLoading) setDeletingJob(null)
            }}
          >
            <section
              className="application-modal delete-confirm-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-confirm-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <h2 id="delete-confirm-title">Delete Application?</h2>

                <button
                  type="button"
                  onClick={() => setDeletingJob(null)}
                  disabled={actionLoading}
                  aria-label="Close confirmation"
                >
                  ×
                </button>
              </div>

              <p>
                Are you sure you want to delete your application for{" "}
                <strong>{deletingJob.title}</strong> at{" "}
                <strong>{deletingJob.company}</strong>?
              </p>

              <p className="delete-warning">
                This action cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setDeletingJob(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDeleteApplication(deletingJob.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Deleting..." : "Delete Application"}
                </button>
              </div>
            </section>
          </div>
        )}

        {selectedInterviewJob !== null && token && (
          <InterviewList
            jobId={selectedInterviewJob}
            token={token}
            onClose={() => setSelectedInterviewJob(null)}
          />
        )}

        {selectedHistoryJob !== null && token && (
          <StatusHistoryModal
            jobId={selectedHistoryJob.id}
            jobTitle={selectedHistoryJob.title}
            company={selectedHistoryJob.company}
            token={token}
            onClose={() => setSelectedHistoryJob(null)}
            onSessionExpired={handleLogout}
          />
        )}

        {activePage === 'applications' && (
        <section
          className="applications-section rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
          id="applications"
        >
          {/* Search and filters */}
          <div className="jt-search-bar-container mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_160px_auto_auto]">
            <input
              type="search"
              className="job-search-input min-w-0 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Search by job title, company, or keyword..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void applyFilters(searchTerm, statusFilter)
                }
              }}
            />

            <select
              className="job-status-filter min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              value={statusFilter}
              onChange={(event) => {
                const selectedStatus = event.target.value
                setStatusFilter(selectedStatus)
                void applyFilters(searchTerm, selectedStatus)
              }}
              aria-label="Filter applications by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              type="button"
              className="primary-button w-full rounded-xl px-5 py-3 text-sm font-semibold transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              onClick={() => void applyFilters(searchTerm, statusFilter)}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            <button
              type="button"
              className="secondary-button w-full rounded-xl px-5 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
                setShowAllJobs(false)
                void refreshDashboard()
              }}
              disabled={loading}
            >
              Clear
            </button>
          </div>

          {/* Section heading */}
          <div className="section-heading mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
                {showAllJobs ? 'All Applications' : 'Recent Applications'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep track of your latest opportunities.
              </p>
            </div>

            {jobs.length > 5 && (
              <button
                type="button"
                className="secondary-button rounded-lg px-4 py-2 text-sm font-medium"
                onClick={() => setShowAllJobs((previous) => !previous)}
              >
                {showAllJobs ? 'Show recent ↑' : 'View all →'}
              </button>
            )}
          </div>

          {actionLoading && (
            <p className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              Processing your request...
            </p>
          )}

          {/* Applications table */}
          <div className="table-wrapper overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Position
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Location
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Applied Date
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading jobs...
                    </td>
                  </tr>
                )}

                {!loading && jobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                      No applications found. Add your first job!
                    </td>
                  </tr>
                )}

                {!loading &&
                  jobs.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4">
                        <strong className="block text-sm font-semibold text-slate-800">
                          {application.title}
                        </strong>
                        <span className="company-name mt-1 block text-sm text-slate-500">
                          {application.company}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {application.location || '—'}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {application.appliedDate || '—'}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`status-badge status-${application.status.toLowerCase()}`}
                        >
                          {application.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="application-actions flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="secondary-button rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-indigo-50"
                            disabled={actionLoading}
                            onClick={() => handleEditApplication(application.id)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="secondary-button rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-indigo-50"
                            disabled={actionLoading}
                            onClick={() => setSelectedHistoryJob(application)}
                          >
                            History
                          </button>

                          <button
                            type="button"
                            className="secondary-button rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-indigo-50"
                            disabled={actionLoading}
                            onClick={() => setSelectedInterviewJob(application.id)}
                          >
                            Interviews
                          </button>

                          <button
                            type="button"
                            className="delete-button rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-red-100"
                            disabled={actionLoading}
                            onClick={() => setDeletingJob(application)}
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
        </section>
        )}

        {activePage === 'interviews' && token && (
          <AllInterviews token={token} onSessionExpired={handleLogout} />
        )}

      </main>
    </div>
  )
}

export default App


