import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import type { ReactElement } from "react"

const BaseSwal = Swal.mixin({ theme: "material-ui" })

export const MySwal = withReactContent(BaseSwal)

export async function showConfirm(options: {
  title: string
  html: string | ReactElement
  confirmText?: string
  cancelText?: string
  icon?: "warning" | "error" | "info" | "question"
  confirmButtonColor?: string
}) {
  const result = await MySwal.fire({
    icon: options.icon || "question",
    title: options.title,
    html: options.html,
    showCancelButton: true,
    confirmButtonText: options.confirmText || "OK",
    cancelButtonText: options.cancelText || "Huỷ",
    confirmButtonColor: options.confirmButtonColor || "#2563eb",
    reverseButtons: true,
  })
  return result.isConfirmed
}

export async function showDeleteConfirm(options: {
  name: string
  html?: string | ReactElement
}) {
  const result = await MySwal.fire({
    title: "Xác nhận xoá",
    icon: "warning",
    html: options.html || `Bạn có chắc muốn xoá <strong>${options.name}</strong>? Hành động này không thể hoàn tác.`,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ",
    confirmButtonColor: "#dc2626",
    reverseButtons: true,
  })
  return result.isConfirmed
}

export async function showSuccessToast(message: string) {
  await MySwal.fire({
    icon: "success",
    title: message,
    confirmButtonColor: "#2563eb",
  })
}

export async function showErrorAlert(message: string) {
  await MySwal.fire({
    icon: "error",
    title: "Lỗi",
    text: message,
    confirmButtonColor: "#2563eb",
  })
}

export async function showSuccessAlert(message: string) {
  await MySwal.fire({
    icon: "success",
    title: message,
    confirmButtonColor: "#2563eb",
  })
}
