import { Component, lazy, Suspense, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import SearchBox from '@/components/SearchBox'
import DateTime from '@/components/DateTime'
import ThemeSwitch from '@/components/ThemeSwitch'
import GroupSection, { type BookmarkGroup } from '@/components/GroupSection'
import bookmarks from '@/bookmarks.json'
const Galaxy = lazy(() => import('@/components/effects/Galaxy'))
const groups: BookmarkGroup[] = bookmarks

class BackgroundBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export default function App() {
  return <MotionConfig reducedMotion="user">
    <BackgroundBoundary><Suspense fallback={null}><Galaxy /></Suspense></BackgroundBoundary>
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
