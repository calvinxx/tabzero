import { useState, type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
export interface Bookmark { name: string; url: string }

export default function LinkCard({ link, index }: { link: Bookmark; index: number }) {
  const url = new URL(link.url)
  return <li className="bookmark-item" style={{ '--entry-delay': `${index * 25}ms` } as CSSProperties}>
    <Card className="bookmark-card">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="bookmark-link" aria-label={`${link.name}（新标签页打开）`}>
        <Favicon link={link} />
        <span className="bookmark-text"><span className="bookmark-name">{link.name}</span><span className="bookmark-domain">{url.hostname.replace(/^www\./, '')}</span></span>
        <ArrowUpRight className="bookmark-arrow" size={15} aria-hidden="true" />
      </a>
    </Card>
  </li>
}

export function Favicon({ link }: { link: Bookmark }) {
  const [iconState, setIconState] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const url = new URL(link.url)
  return <span className="favicon" aria-hidden="true"><span>{[...link.name][0]?.toUpperCase()}</span>{iconState !== 'failed' && <img src={`${url.origin}/favicon.ico`} alt="" width="23" height="23" decoding="async" referrerPolicy="no-referrer" style={{ opacity: iconState === 'loaded' ? 1 : 0 }} onLoad={() => setIconState('loaded')} onError={() => setIconState('failed')} />}</span>
}
