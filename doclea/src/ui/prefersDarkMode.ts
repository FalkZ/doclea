export const prefersDarkMode = Boolean(
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
)
