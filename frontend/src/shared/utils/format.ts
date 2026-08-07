const EMPTY_VALUE = "Chưa có"

export function displayValue(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized || EMPTY_VALUE
}

export function formatDateOnly(value: string | null | undefined) {
  const normalized = value?.slice(0, 10)
  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return EMPTY_VALUE

  const [year, month, day] = normalized.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return EMPTY_VALUE
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date).replace(", ", " lúc ")
}
