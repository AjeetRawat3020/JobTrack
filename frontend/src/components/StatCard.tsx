type StatCardProps = {
  label: string
  value: string
  symbol: string
}

function StatCard({ label, value, symbol }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
          {symbol}
        </span>
      </div>

      <strong className="mt-5 block text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
        {value}
      </strong>

      <p className="mt-2 text-xs text-slate-400 sm:text-sm">
        Across your job search
      </p>
    </article>
  )
}

export default StatCard