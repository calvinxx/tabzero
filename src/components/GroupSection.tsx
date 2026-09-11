import { Bookmark as BookmarkIcon } from 'lucide-react'
import BlurText from '@/components/effects/BlurText'
import LinkCard, { type Bookmark } from '@/components/LinkCard'
export interface BookmarkGroup { name: string; links: Bookmark[] }
export default function GroupSection({ group, index }: { group: BookmarkGroup; index: number }) {
  return <section className="bookmark-group" aria-labelledby={`group-${index}`}>
    <div className="group-heading"><h2 id={`group-${index}`}><BookmarkIcon size={15} aria-hidden="true" /><BlurText text={group.name} /></h2><span className="group-count">{group.links.length.toString().padStart(2, '0')}</span></div>
    {group.links.length ? <ul className="bookmark-grid">{group.links.map((link, i) => <LinkCard key={link.url} link={link} index={i} />)}</ul> : <p className="empty-state">这里还没有书签。</p>}
  </section>
}
