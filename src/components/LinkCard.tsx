import { useState, type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { recordVisit } from '@/lib/recent'
export interface Bookmark { name: string; url: string }

export default function LinkCard({ link, index }: { link: Bookmark; index: number }) {
  const url = new URL(link.url)
  return <li className="bookmark-item" style={{ '--entry-delay': `${index * 25}ms` } as CSSProperties}>
    <Card className="bookmark-card">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="bookmark-link" aria-label={`${link.name}（新标签页打开）`} onClick={() => recordVisit(link.url)}>
        <Favicon link={link} />
        <span className="bookmark-text"><span className="bookmark-name">{link.name}</span><span className="bookmark-domain">{url.hostname.replace(/^www\./, '')}</span></span>
        <ArrowUpRight className="bookmark-arrow" size={15} aria-hidden="true" />
      </a>
    </Card>
  </li>
}

export function Favicon({ link }: { link: Bookmark }) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const url = new URL(link.url)
  // High-res first, classic .ico next, Google's cache as a bonus level, letter tile as last resort.
  const candidates = [
    `${url.origin}/apple-touch-icon.png`,
    `${url.origin}/favicon.ico`,
    `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`,
  ]
  const failed = index >= candidates.length
  return <span className="favicon" aria-hidden="true"><span style={{ opacity: loaded ? 0 : 1 }}>{[...link.name][0]?.toUpperCase()}</span>{!failed && <img src={candidates[index]} alt="" width="23" height="23" decoding="async" referrerPolicy="no-referrer" style={{ opacity: loaded ? 1 : 0 }} onLoad={() => setLoaded(true)} onError={() => setIndex(i => i + 1)} />}</span>
}
