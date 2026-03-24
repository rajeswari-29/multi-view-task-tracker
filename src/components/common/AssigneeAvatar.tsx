import { useMemo } from 'react'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const a = parts[0]?.[0] ?? ''
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (a + b).toUpperCase()
}

function colorFromString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 75% 45%)`
}

export function AssigneeAvatar(props: { name: string }) {
  const bg = useMemo(() => colorFromString(props.name), [props.name])
  const text = initials(props.name)

  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-xs font-semibold text-white"
      style={{ background: bg }}
      aria-label={`Assignee: ${props.name}`}
    >
      {text}
    </span>
  )
}

