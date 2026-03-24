import { PRIORITY_META } from '../../types/task'
import type { PriorityId } from '../../types/task'

export function PriorityBadge(props: { priority: PriorityId }) {
  const meta = PRIORITY_META[props.priority]
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        meta.color,
        meta.border,
        meta.text,
      ].join(' ')}
    >
      {meta.label}
    </span>
  )
}

