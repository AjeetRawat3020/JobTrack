import { useState } from 'react'

type RegisterProps = {
  onShowLogin: () => void
}

function Register({ onShowLogin }: RegisterProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Registration failed.')
      }

      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setShowSuccessPopup(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create your account.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleGoToLogin() {
    setShowSuccessPopup(false)
    onShowLogin()
  }

  const inputClasses =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70'

  return (
    <main className="login-page flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6">
      <form
        className="login-card flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="mb-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-extrabold text-white shadow-lg shadow-indigo-200">
            J
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Create Account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Join JobTrack and organize your job search.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="register-username"
            className="text-sm font-semibold text-slate-700"
          >
            Username
          </label>
          <input
            id="register-username"
            type="text"
            className={inputClasses}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Choose a username"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="register-password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            className={inputClasses}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Create a password"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-semibold text-slate-700"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            className={inputClasses}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
          />
        </div>

        {error && (
          <p
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="mt-2 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            className="rounded-md px-1 font-bold text-indigo-600 transition hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            onClick={handleGoToLogin}
          >
            Sign In
          </button>
        </p>
      </form>

      {showSuccessPopup && (
        <div
          className="success-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={handleGoToLogin}
        >
          <section
            className="success-popup w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-600">
              ✓
            </div>

            <h2
              id="success-title"
              className="text-2xl font-extrabold tracking-tight text-slate-900"
            >
              Account Created!
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your JobTrack account has been created successfully. You can now
              sign in with your username and password.
            </p>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              onClick={handleGoToLogin}
            >
              Go to Login
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default Register
