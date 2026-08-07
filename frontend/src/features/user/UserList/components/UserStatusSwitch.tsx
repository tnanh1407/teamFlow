import { LoaderCircle } from "lucide-react"

interface UserStatusSwitchProps {
  checked: boolean
  disabled?: boolean
  pending?: boolean
  onToggle: () => void
}

export default function UserStatusSwitch({
  checked,
  disabled = false,
  pending = false,
  onToggle,
}: UserStatusSwitchProps) {
  const label = checked ? "Đang hoạt động" : "Ngừng hoạt động"

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        title={label}
        disabled={disabled || pending}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          checked
            ? "border-success bg-success"
            : "border-border bg-muted"
        } ${(disabled || pending) ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        >
          {pending ? <LoaderCircle size={12} className="animate-spin text-muted-foreground" /> : null}
        </span>
      </button>

      <span className={`text-xs font-medium ${checked ? "text-success" : "text-muted-foreground"}`}>{label}</span>
    </div>
  )
}
