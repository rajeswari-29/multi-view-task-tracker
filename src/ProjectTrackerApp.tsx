import { Suspense, useEffect, useMemo, useState, lazy } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ASSIGNEES } from './data/seedTasks'
import { ListView } from './components/list/ListView'
import { FiltersBar } from './components/FiltersBar'
import { useTasksStore } from './store/tasksStore'
import {
  filtersToQueryParams,
  hasAnyFilter,
  parseFiltersFromQueryParams,
} from './lib/urlFilters'
import type { FiltersState } from './lib/urlFilters'
import { usePresenceSimulation } from './hooks/usePresenceSimulation'

type ViewId = 'kanban' | 'list' | 'timeline'

const KanbanBoardView = lazy(async () => {
  const mod = await import('./components/kanban/KanbanBoard')
  return { default: mod.KanbanBoard }
})

const TimelineView = lazy(async () => {
  const mod = await import('./components/timeline/TimelineView')
  return { default: mod.TimelineView }
})

export default function ProjectTrackerApp() {
  const { tasks } = useTasksStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState<ViewId>('list')

  const queryKey = searchParams.toString()
  const filters: FiltersState = useMemo(() => {
    return parseFiltersFromQueryParams(searchParams)
  }, [queryKey])

  // Preload the other views in the background so view switching feels instant.
  useEffect(() => {
    void import('./components/kanban/KanbanBoard')
    void import('./components/timeline/TimelineView')
  }, [])

  const filteredTasks = useMemo(() => {
    const statusSet = new Set(filters.status)
    const prioritySet = new Set(filters.priority)
    const assigneeSet = new Set(filters.assignees)
    const from = filters.dueFrom
    const to = filters.dueTo

    return tasks.filter((t) => {
      if (statusSet.size && !statusSet.has(t.status)) return false
      if (prioritySet.size && !prioritySet.has(t.priority)) return false
      if (assigneeSet.size && !assigneeSet.has(t.assigneeId)) return false
      if (from && t.dueDate < from) return false
      if (to && t.dueDate > to) return false
      return true
    })
  }, [filters, tasks])

  const assigneeNamesById = useMemo(() => {
    const m: Record<string, string> = {}
    for (const u of ASSIGNEES) m[u.id] = u.name
    return m
  }, [])

  const presence = usePresenceSimulation(filteredTasks, { animate: view !== 'list' })
  const canClearFilters = hasAnyFilter(filters)

  const applyFilters = (next: FiltersState) => {
    setSearchParams(filtersToQueryParams(next))
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-slate-900">Project Tracker</h1>
            <div className="text-sm font-medium text-slate-600">
              {presence.activeUserCount} people are viewing this board
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={[
                'rounded-md border px-3 py-2 text-sm font-semibold',
                view === 'kanban'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={[
                'rounded-md border px-3 py-2 text-sm font-semibold',
                view === 'list'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView('timeline')}
              className={[
                'rounded-md border px-3 py-2 text-sm font-semibold',
                view === 'timeline'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              Timeline
            </button>
          </div>
        </header>

        <div className="mt-4">
          <FiltersBar
            filters={filters}
            onSetFilters={applyFilters}
            canClearFilters={canClearFilters}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="mt-4">
          {view === 'kanban' ? (
            <Suspense fallback={<div className="text-sm text-slate-600">Loading Kanban...</div>}>
              <KanbanBoardView
                tasks={filteredTasks}
                assigneeNamesById={assigneeNamesById}
                presence={presence}
              />
            </Suspense>
          ) : null}
          {view === 'list' ? (
            <ListView
              tasks={filteredTasks}
              assigneeNamesById={assigneeNamesById}
              canClearFilters={canClearFilters}
              onClearFilters={clearFilters}
            />
          ) : null}
          {view === 'timeline' ? (
            <Suspense fallback={<div className="text-sm text-slate-600">Loading Timeline...</div>}>
              <TimelineView
                tasks={filteredTasks}
                presence={presence}
                canClearFilters={canClearFilters}
                onClearFilters={clearFilters}
              />
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  )
}

