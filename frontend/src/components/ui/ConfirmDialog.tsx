import { AlertTriangle, Info, HelpCircle, XCircle } from "lucide-react"
import Modal from "./Modal"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  children: React.ReactNode
  variant?: "info" | "warning" | "danger" | "help"
  confirmText?: string
  cancelText?: string
  confirmOnly?: boolean
}

const iconMap = {
  info: { icon: Info, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/40" },
  warning: { icon: AlertTriangle, color: "text-amber-500 bg-amber-100 dark:bg-amber-900/40" },
  danger: { icon: XCircle, color: "text-red-500 bg-red-100 dark:bg-red-900/40" },
  help: { icon: HelpCircle, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/40" },
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  variant = "info",
  confirmText = "OK",
  cancelText = "Huỷ",
  confirmOnly = false,
}: ConfirmDialogProps) {
  const { icon: Icon, color } = iconMap[variant]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={400}
      footer={
        confirmOnly ? (
          <button
            onClick={onConfirm || onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer border-none"
          >
            {confirmText}
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer border-none"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm?.()
                onClose()
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition cursor-pointer border-none ${
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmText}
            </button>
          </>
        )
      }
    >
      <div className="flex gap-4 items-start">
        <div className={`p-2 rounded-xl shrink-0 ${color}`}>
          <Icon size={22} />
        </div>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-0.5">
          {children}
        </div>
      </div>
    </Modal>
  )
}
