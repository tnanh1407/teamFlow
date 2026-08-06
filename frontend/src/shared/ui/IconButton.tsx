import type { ButtonHTMLAttributes, ReactNode } from "react"

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function IconButton({ children, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={`border-none bg-transparent p-0.5 text-muted-foreground/50 transition hover:bg-muted hover:text-foreground cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
