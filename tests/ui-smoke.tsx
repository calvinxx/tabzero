// With npm run dev running, invoke runChecks() through Vite in a browser:
// await page.evaluate(async () => (await import('/tests/ui-smoke.tsx')).runChecks())
import { Profiler } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import LinkCard, { Favicon } from '../src/components/LinkCard'
import Magnet from '../src/components/effects/Magnet'
import { recentUrls } from '../src/lib/recent'

export function runChecks() {
  const check = (ok: unknown, message: string) => { if (!ok) throw new Error(message) }
  const host = document.body.appendChild(document.createElement('div'))
  host.style.cssText = 'position:fixed;left:0;top:0;width:200px;z-index:100'
  host.addEventListener('click', event => event.preventDefault())
  host.addEventListener('auxclick', event => event.preventDefault())
  const root = createRoot(host)
  const previous = localStorage.getItem('tabzero:recent')
  const link = { name: 'UI check', url: `${location.origin}/ui-check`, icon: '/favicon.svg?old' }
  try {
    localStorage.removeItem('tabzero:recent')
    flushSync(() => root.render(<LinkCard link={link} index={0} />))
    check(host.querySelector('img')?.loading === 'lazy', 'Card icons must load lazily')
    const anchor = host.querySelector('a')!
    anchor.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 2 }))
    check(recentUrls().length === 0, 'Right click must not record a visit')
    anchor.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }))
    check(recentUrls()[0] === link.url, 'Middle click must record a visit')

    flushSync(() => root.render(<Favicon link={link} />))
    check(host.querySelector('img')?.loading === 'eager', 'Search icons should load immediately')
    // Exhaust all candidates before changing only the icon, keeping the URL stable.
    for (let i = 0; i < 4; i++) {
      flushSync(() => host.querySelector('img')?.dispatchEvent(new Event('error')))
    }
    check(!host.querySelector('img'), 'Exhausted icons must show the letter fallback')
    flushSync(() => root.render(<Favicon link={{ ...link, icon: '/favicon.svg?new' }} />))
    check(host.querySelector('img')?.getAttribute('src') === '/favicon.svg?new', 'Changed icon must restart at the custom source')
    flushSync(() => host.querySelector('img')!.dispatchEvent(new Event('load')))
    flushSync(() => root.render(<Favicon link={{ ...link, icon: '/favicon.svg?next' }} />))
    check(host.querySelector('img')?.style.opacity === '0', 'Changed icon must reset loaded state')

    let commits = 0
    const magnet = (disabled = false) => <Profiler id="magnet" onRender={() => commits++}>
      <Magnet disabled={disabled}><button>Magnet check</button></Magnet>
    </Profiler>
    flushSync(() => root.render(magnet()))
    const baseline = commits
    const inner = host.querySelector('button')!.parentElement!
    const neutral = inner.style.transform
    const move = (clientX: number, clientY: number) => flushSync(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }))
    })
    for (let i = 0; i < 10; i++) move(1000 + i, 1000)
    check(commits === baseline, 'Distant pointer movement must not re-render Magnet')
    const rect = inner.parentElement!.getBoundingClientRect()
    move(rect.left + rect.width / 2 + 10, rect.top + rect.height / 2)
    check(inner.style.transform !== neutral, 'Nearby pointer must move Magnet')
    check(commits === baseline, 'Magnetic movement must not re-render Magnet')
    move(1000, 1000)
    check(inner.style.transform === neutral, 'Leaving Magnet must reset its position')
    move(rect.left + rect.width / 2 + 10, rect.top + rect.height / 2)
    flushSync(() => root.render(magnet(true)))
    move(rect.left + rect.width / 2 + 10, rect.top + rect.height / 2)
    check(inner.style.transform === neutral && inner.style.transition === 'none', 'Disabled Magnet must stay at rest without animation')
    return 'UI checks passed: middle click, lazy icons, icon reset, Magnet movement and disable'
  } finally {
    root.unmount()
    host.remove()
    if (previous === null) localStorage.removeItem('tabzero:recent')
    else localStorage.setItem('tabzero:recent', previous)
  }
}
