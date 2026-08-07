interface LoadingStateProps {
  label?: string
  className?: string
}

export default function LoadingState({ label = "Đang tải...", className = "min-h-64" }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
