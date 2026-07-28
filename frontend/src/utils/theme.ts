export const theme = {
  success : getComputedStyle(document.documentElement).getPropertyValue("--success").trim(),
  danger : getComputedStyle(document.documentElement).getPropertyValue("--danger").trim(),
}