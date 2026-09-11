export const engines = {
  google: { name: 'Google', mark: 'G', url: 'https://www.google.com/search?q=' },
  baidu: { name: '百度', mark: '百', url: 'https://www.baidu.com/s?wd=' },
  bing: { name: 'Bing', mark: 'b', url: 'https://www.bing.com/search?q=' },
  duckduckgo: { name: 'DuckDuckGo', mark: 'D', url: 'https://duckduckgo.com/?q=' },
} as const
export type Engine = keyof typeof engines
export const storageKey = 'tabzero:engine'
export function isEngine(value: unknown): value is Engine {
  return typeof value === 'string' && Object.hasOwn(engines, value)
}

export function searchDestination(input: string, engine: Engine): string | null {
  const text = input.trim()
  if (!text) return null
  const explicit = /^https?:\/\//i.test(text)
  const local = /^(localhost|(?:\d{1,3}\.){3}\d{1,3}|\[[\da-f:]+\])(?::\d+)?(?:[/?#]|$)/i.test(text)
  // A port on a bare hostname is not a URL scheme.
  if (!explicit && !local && /^[a-z][a-z\d+.-]*:/i.test(text) && !/^[^:/]+:\d+(?:[/?#]|$)/.test(text)) {
    throw new Error('只支持 http:// 或 https:// 网址，请修改后重试。')
  }
  if (!/\s/.test(text)) {
    try {
      const url = new URL(explicit ? text : `${local ? 'http' : 'https'}://${text}`)
      const host = url.hostname
      const domain = host.length <= 253 && host.split('.').every(label => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label)) && /\.(?:[a-z]{2,63}|xn--[a-z\d-]+)$/i.test(host)
      if ((explicit || local || domain) && !url.username && !url.password && !text.includes('\\')) return url.href
    } catch { /* Invalid bare URLs are ordinary search queries. */ }
  }
  if (explicit) throw new Error('网址格式不正确，请检查后重试。')
  return engines[engine].url + encodeURIComponent(text)
}

export function matchBookmarks(groups: { name: string; links: { name: string; url: string }[] }[], input: string) {
  const query = input.trim().toLowerCase()
  if (!query) return []
  return groups.flatMap(group => group.links
    .filter(link => link.name.toLowerCase().includes(query) || new URL(link.url).hostname.toLowerCase().includes(query))
    .map(link => ({ ...link, group: group.name }))).slice(0, 5)
}
