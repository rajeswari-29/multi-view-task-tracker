import { useMemo, useRef, useState } from 'react'
import { STATUS_META } from '../../types/task'
import type { StatusId } from '../../types/task'
import { cn } from '../../lib/classNames'
import { useOutsideClick } from '../../hooks/useOutsideClick'

const STATUS_OPTIONS: Array<{ value: StatusId; label: string }> = [
  { value: 'todo', label: STATUS_META.todo.label },
  { value: 'inprogress', label: STATUS_META.inprogress.label },
  { value: 'inreview', label: STATUS_META.inreview.label },
  { value: 'done', label: STATUS_META.done.label },
]

export function StatusDropdown(props: { value: StatusId; onChange: (next: StatusId) => void }) {
  const { value, onChange } = props
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useOutsideClick(rootRef, () => setOpen(false), open)

  const label = useMemo(() => STATUS_META[value].label, [value])

  return (
    <div className="relative inline-block w-full text-left" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-md border px-2 py-1 text-sm',
          open ? 'border-slate-400 shadow-sm' : 'border-slate-200',
        )}
      >
        <span className="truncate text-slate-800">{label}</span>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-md border border-slate-200 bg-white shadow-lg">
          {STATUS_OPTIONS.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between px-2 py-2 text-sm hover:bg-slate-50',
                  active ? 'bg-slate-50' : '',
                )}
              >
                <span className="text-slate-800">{opt.label}</span>
                {active ? <span className="text-slate-600">✓</span> : <span className="w-4" />}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

