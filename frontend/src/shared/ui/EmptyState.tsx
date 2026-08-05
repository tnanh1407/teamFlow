import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ title, description, action, className = "min-h-64" }: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{title}</p>
        {description && <p className="text-sm text-zinc-400 dark:text-zinc-500">{description}</p>}
        {action}
      </div>
    </div>
  )
}
