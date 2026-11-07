import React, { useEffect } from 'react'

export type JobStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export type JobFormData = {
  title: string
  company: string
  location: string
  jobType: string
  description: string
  status: JobStatus
  appliedDate: string
  jobUrl: string
  notes: string
}

type AddApplicationModalProps = {
  onClose: () => void
  onSubmit: (formData: JobFormData) => void | Promise<void>
  initialData?: JobFormData
  isEditing?: boolean
}

const emptyForm: JobFormData = {
  title: '',
  company: '',
  location: '',
  jobType: '',
  description: '',
  status: 'SAVED',
  appliedDate: '',
  jobUrl: '',
  notes: '',
}

const inputClasses =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'

const labelClasses = 'block text-sm font-medium text-slate-700'

function AddApplicationModal({
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: AddApplicationModalProps) {
  const [formData, setFormData] = React.useState<JobFormData>(
    initialData ?? emptyForm
  )
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')

  useEffect(() => {
    setFormData(initialData ?? emptyForm)
  }, [initialData])

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save application. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={saving ? undefined : onClose}
    >
      <section
        className="application-modal my-3 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:my-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-application-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2
              id="add-application-title"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              {isEditing ? 'Edit Application' : 'Add New Application'}
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {isEditing
                ? 'Update your job application details.'
                : 'Keep track of your next career opportunity.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl leading-none text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="application-form space-y-5 px-5 py-5 sm:px-7 sm:py-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <label className={labelClasses}>
              Job Title <span className="text-rose-500">*</span>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                required
                disabled={saving}
                className={inputClasses}
              />
            </label>

            <label className={labelClasses}>
              Company Name <span className="text-rose-500">*</span>
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Google"
                required
                disabled={saving}
                className={inputClasses}
              />
            </label>

            <label className={labelClasses}>
              Location
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                disabled={saving}
                className={inputClasses}
              />
            </label>

            <label className={labelClasses}>
              Job Type
              <input
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                placeholder="e.g. Full-time"
                disabled={saving}
                className={inputClasses}
              />
            </label>

            <label className={labelClasses}>
              Status
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={saving}
                className={inputClasses}
              >
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </label>

            <label className={labelClasses}>
              Applied Date
              <input
                type="date"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
                disabled={saving}
                className={inputClasses}
              />
            </label>

            <label className={`${labelClasses} sm:col-span-2`}>
              Job URL
              <input
                type="url"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleChange}
                placeholder="https://example.com/job"
                disabled={saving}
                className={inputClasses}
              />
            </label>

            <label className={`${labelClasses} sm:col-span-2`}>
              Job Description <span className="text-rose-500">*</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role..."
                rows={4}
                required
                disabled={saving}
                className={`${inputClasses} min-h-28 resize-y`}
              />
            </label>

            <label className={`${labelClasses} sm:col-span-2`}>
              Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add your notes..."
                rows={3}
                disabled={saving}
                className={`${inputClasses} min-h-24 resize-y`}
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="modal-actions flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Update Application'
                  : 'Save Application'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AddApplicationModal
