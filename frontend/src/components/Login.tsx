import { useState } from 'react'

type LoginProps = {
  onLoginSuccess: (token: string, username: string) => void
  onShowRegister: () => void
}

function Login({ onLoginSuccess, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed. Check your username and password.')
      }

      const data = await response.json()

      if (!data.token) {
        throw new Error('Login response did not contain a token.')
      }

      // Token aur logged-in username dono App.tsx ko bhejo.
      onLoginSuccess(data.token, username.trim())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setLoading(false)
    }
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
            Welcome to JobTrack
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to manage your job applications.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-slate-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            className={inputClasses}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className={inputClasses}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 pt-5 text-sm">
          <span className="text-slate-500">New to JobTrack?</span>
          <button
            type="button"
            className="rounded-md px-1 font-bold text-indigo-600 transition hover:text-indigo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            onClick={onShowRegister}
          >
            Create an account
          </button>
        </div>
      </form>
    </main>
  )
}

export default Login
