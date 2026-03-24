export function EmptyState(props: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white/50 p-6 text-center">
      <div className="text-sm font-semibold text-slate-700">{props.title}</div>
      {props.description ? (
        <div className="text-sm text-slate-600">{props.description}</div>
      ) : null}
      {props.actionLabel && props.onAction ? (
        <button
          type="button"
          onClick={props.onAction}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {props.actionLabel}
        </button>
      ) : null}
    </div>
  )
}

