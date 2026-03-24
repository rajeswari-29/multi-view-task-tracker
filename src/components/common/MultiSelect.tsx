import { useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/classNames'
import { useOutsideClick } from '../../hooks/useOutsideClick'

export function MultiSelect(props: {
  label: string
  values: string[]
  options: Array<{ value: string; label: string }>
  onChange: (next: string[]) => void
}) {
  const { label, values, options, onChange } = props
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useOutsideClick(rootRef, () => setOpen(false), open)

  const selectedLabels = useMemo(() => {
    const set = new Set(values)
    return options.filter((o) => set.has(o.value)).map((o) => o.label)
  }, [options, values])

  const toggle = (value: string) => {
    const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
    onChange(next)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-md border bg-white px-3 py-2 text-sm',
          open ? 'border-slate-400 shadow-sm' : 'border-slate-200',
        )}
      >
        <span className="truncate text-left text-slate-700">
          <span className="font-semibold">{label}:</span>{' '}
          {values.length ? (
            <span className="text-slate-800">{selectedLabels.join(', ')}</span>
          ) : (
            <span className="text-slate-500">Any</span>
          )}
        </span>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="max-h-56 overflow-auto p-2">
            {options.map((opt) => {
              const checked = values.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-800">{opt.label}</span>
                </label>
              )
            })}
          </div>
          <div className="border-t border-slate-200 p-2">
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Clear {label}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

