export function getPositionLabel(positionName?: string | null) {
  const normalized = positionName?.trim().toLowerCase()

  if (!normalized) return "—"
  if (normalized === "leader") return "Trưởng bộ phận"
  if (normalized === "manager") return "Quản lý nhóm"

  return positionName ?? "—"
}

export function isLeaderPosition(positionName?: string | null) {
  return positionName?.trim().toLowerCase() === "leader"
}
