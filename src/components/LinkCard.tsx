import { useState, type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { recordVisit } from '@/lib/recent'
export interface Bookmark { name: string; url: string; icon?: string }

export default function LinkCard({ link, index }: { link: Bookmark; index: number }) {
  const url = new URL(link.url)
  return <li className="bookmark-item" style={{ '--entry-delay': `${index * 25}ms` } as CSSProperties}>
    <Card className="bookmark-card">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="bookmark-link" aria-label={`${link.name}（新标签页打开）`} onClick={() => recordVisit(link.url)} onAuxClick={event => { if (event.button === 1) recordVisit(link.url) }}>
        <Favicon link={link} loading="lazy" />
        <span className="bookmark-text"><span className="bookmark-name">{link.name}</span><span className="bookmark-domain">{url.hostname.replace(/^www\./, '')}</span></span>
        <ArrowUpRight className="bookmark-arrow" size={15} aria-hidden="true" />
      </a>
    </Card>
  </li>
}

type FaviconProps = { link: Bookmark; loading?: 'eager' | 'lazy' }

export function Favicon(props: FaviconProps) {
  return <FaviconImage key={JSON.stringify([props.link.url, props.link.icon])} {...props} />
}

function FaviconImage({ link, loading = 'eager' }: FaviconProps) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const url = new URL(link.url)
  // Deterministic per-site hue so fallback letter tiles stay distinguishable.
  let hash = 5381
  for (const ch of url.hostname) hash = (hash * 33 ^ ch.charCodeAt(0)) >>> 0
  const tileStyle = { '--tile-hue': hash % 360 } as CSSProperties
  // Optional pinned icon first (for sites serving broken favicons), then
  // high-res apple-touch-icon, classic .ico, Google's cache, letter tile last.
  const candidates = [
    ...link.icon ? [link.icon] : [],
    `${url.origin}/apple-touch-icon.png`,
    `${url.origin}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`,
  ]
  const failed = index >= candidates.length
  return <span className="favicon" style={tileStyle} aria-hidden="true"><span style={{ opacity: loaded ? 0 : 1 }}>{[...link.name][0]?.toUpperCase()}</span>{!failed && <img src={candidates[index]} alt="" width="23" height="23" loading={loading} decoding="async" referrerPolicy="no-referrer" style={{ opacity: loaded ? 1 : 0 }} onLoad={() => setLoaded(true)} onError={() => setIndex(i => i + 1)} />}</span>
}
