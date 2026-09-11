import { MotionConfig } from 'motion/react'
import SearchBox from '@/components/SearchBox'
import DateTime from '@/components/DateTime'
import ThemeSwitch from '@/components/ThemeSwitch'
import GroupSection, { type BookmarkGroup } from '@/components/GroupSection'
import bookmarks from '@/bookmarks.json'
const groups: BookmarkGroup[] = bookmarks

export default function App() {
  return <MotionConfig reducedMotion="user">
    <div className="page">
      <ThemeSwitch />
      <main id="main">
        <h1 className="sr-only">搜索与书签</h1>
        <div className="intro"><DateTime /><SearchBox /></div>
        <div className="bookmarks" role="region" aria-label="书签" tabIndex={0}>{groups.length ? groups.map((group, index) => <GroupSection key={group.name} group={group} index={index} />) : <p className="empty-state">还没有书签，先搜索想去的地方吧。</p>}</div>
      </main>
    </div>
  </MotionConfig>
}
