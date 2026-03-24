import { useMemo } from 'react'
import { ASSIGNEES } from '../data/seedTasks'
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from '../types/task'
import type { PriorityId, StatusId } from '../types/task'
import type { FiltersState } from '../lib/urlFilters'
import { MultiSelect } from './common/MultiSelect'
import { cn } from '../lib/classNames'

export function FiltersBar(props: {
  filters: FiltersState
  onSetFilters: (next: FiltersState) => void
  canClearFilters: boolean
  onClearFilters: () => void
}) {
  const { filters, onSetFilters, canClearFilters, onClearFilters } = props

  const statusOptions = useMemo(
    () => STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label })),
    [],
  )

  const priorityOptions = useMemo(() => {
    const order: PriorityId[] = ['critical', 'high', 'medium', 'low']
    return order.map((p) => ({ value: p, label: PRIORITY_META[p].label }))
  }, [])

  const assigneeOptions = useMemo(() => ASSIGNEES.map((u) => ({ value: u.id, label: u.name })), [])

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_1fr] lg:grid-cols-[1.1fr_1.1fr_1.2fr_1.2fr]">
        <MultiSelect
          label="Status"
          values={filters.status}
          options={statusOptions}
          onChange={(next) => onSetFilters({ ...filters, status: next as StatusId[] })}
        />

        <MultiSelect
          label="Priority"
          values={filters.priority}
          options={priorityOptions}
          onChange={(next) => onSetFilters({ ...filters, priority: next as PriorityId[] })}
        />

        <MultiSelect
          label="Assignee"
          values={filters.assignees}
          options={assigneeOptions}
          onChange={(next) => onSetFilters({ ...filters, assignees: next })}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Due From</label>
            <input
              type="date"
              value={filters.dueFrom ?? ''}
              onChange={(e) => onSetFilters({ ...filters, dueFrom: e.target.value || null })}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Due To</label>
            <input
              type="date"
              value={filters.dueTo ?? ''}
              onChange={(e) => onSetFilters({ ...filters, dueTo: e.target.value || null })}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-3">
        {canClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className={cn(
              'rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800',
            )}
          >
            Clear all filters
          </button>
        ) : null}
      </div>
    </div>
  )
}

