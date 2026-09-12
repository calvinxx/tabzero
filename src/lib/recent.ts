const storageKey = 'tabzero:recent'
const limit = 8

export function recentUrls(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch { return [] }
}

export function recordVisit(url: string): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify([url, ...recentUrls().filter(item => item !== url)].slice(0, limit)))
  } catch { /* Visits simply aren't recorded when storage is disabled. */ }
}
