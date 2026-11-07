import { useEffect, useState, type FormEvent } from 'react'

export type InterviewFormData = {
  interviewDate: string
  round: string
  notes: string
  status: 'Scheduled' | 'Completed' | 'Passed' | 'Failed'
}

type InterviewModalProps = {
  onClose: () => void
  onSubmit: (data: InterviewFormData) => Promise<void>
  initialData?: InterviewFormData
  isEditing?: boolean
}

const emptyForm: InterviewFormData = {
  interviewDate: '',
  round: '',
  notes: '',
  status: 'Scheduled',
}

const inputClasses =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
const labelClasses = 'block text-sm font-medium text-slate-700'

function InterviewModal({
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: InterviewModalProps) {
  const [formData, setFormData] = useState<InterviewFormData>(
    initialData ?? emptyForm
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setFormData(initialData ?? emptyForm)
  }, [initialData])

  function updateField<K extends keyof InterviewFormData>(
    field: K,
    value: InterviewFormData[K]
  ) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!formData.interviewDate || !formData.round.trim()) {
      setError('Please enter the interview date and round.')
      return
    }

    try {
      setSubmitting(true)
      await onSubmit({
        ...formData,
        round: formData.round.trim(),
        notes: formData.notes.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save interview.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="interview-modal-title"
        className="my-6 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 id="interview-modal-title" className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Interview' : 'Add Interview'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={labelClasses}>
            Interview date and time
            <input
              type="datetime-local"
              required
              value={formData.interviewDate}
              onChange={(event) => updateField('interviewDate', event.target.value)}
              className={inputClasses}
            />
          </label>

          <label className={labelClasses}>
            Interview round
            <input
              type="text"
              required
              placeholder="e.g. Technical Round 1"
              value={formData.round}
              onChange={(event) => updateField('round', event.target.value)}
              className={inputClasses}
            />
          </label>

          <label className={labelClasses}>
            Status
            <select
              value={formData.status}
              onChange={(event) =>
                updateField('status', event.target.value as InterviewFormData['status'])
              }
              className={inputClasses}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </label>

          <label className={labelClasses}>
            Notes
            <textarea
              rows={3}
              placeholder="Add any interview details..."
              value={formData.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              className={inputClasses}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Interview' : 'Save Interview'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default InterviewModal
