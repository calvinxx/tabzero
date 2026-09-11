export const themeKey = 'tabzero:theme'
export const themes = { system: '跟随系统', light: '浅色', dark: '深色' } as const
export type Theme = keyof typeof themes
export function parseTheme(value: unknown): Theme {
  return typeof value === 'string' && Object.hasOwn(themes, value) ? value as Theme : 'system'
}
export function readTheme(): Theme {
  try { return parseTheme(localStorage.getItem(themeKey)) } catch { return 'system' }
}
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
}
