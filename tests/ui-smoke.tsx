// With npm run dev running, invoke runChecks() through Vite in a browser:
// await page.evaluate(async () => (await import('/tests/ui-smoke.tsx')).runChecks())
import { Profiler } from 'react'
import { Renderer } from 'ogl'
import Galaxy from '../src/components/effects/Galaxy'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import LinkCard, { Favicon } from '../src/components/LinkCard'
import Magnet from '../src/components/effects/Magnet'
import SplitFlapText from '../src/components/effects/SplitFlapText'
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

export function runClockChecks(reduced = false) {
  const check = (ok: unknown, message: string) => { if (!ok) throw new Error(message) }
  const host = document.body.appendChild(document.createElement('div'))
  const root = createRoot(host)
  const render = (text: string) => flushSync(() => root.render(<SplitFlapText text={text} />))
  try {
    render('23:59:58')
    check(host.querySelectorAll('.split-flap-text__tile').length === 6, 'Clock needs six digit tiles')
    check(!host.querySelector('.split-flap-text__flap'), 'Initial time must render without shuffling')
    const firstTile = host.querySelector('.split-flap-text__tile')
    const separator = host.querySelector('.split-flap-text__separator')
    render('23:59:59')
    check(host.querySelector('.split-flap-text__tile') === firstTile, 'Unchanged digits must keep their tiles')
    check(host.querySelector('.split-flap-text__separator') === separator, 'Separators must remain stationary')
    check(host.querySelectorAll('.split-flap-text__flap').length === 2, 'Only the changed digit may flip')
    const back = host.querySelector('.split-flap-text__flap--back')!
    check(getComputedStyle(back).animationName === (reduced ? 'none' : 'split-flap-back'), 'CSS must honor the current motion preference')
    if (reduced) check(getComputedStyle(back).transform === 'none', 'Reduced motion must show the new digit immediately')
    render('00:00:00')
    check([...host.querySelectorAll('.split-flap-text__half--top')].map(el => el.textContent).join('') === '000000', 'Midnight rollover must update all digits')
    check(host.querySelectorAll('.split-flap-text__flap').length === 12, 'Rollover must update all six flaps')
    check(host.querySelector('.split-flap-text')?.getAttribute('aria-hidden') === 'true', 'Duplicate visual glyphs must be hidden from screen readers')
    return `Clock checks passed (reduced motion: ${reduced})`
  } finally {
    root.unmount()
    host.remove()
  }
}

export async function runGalaxyChecks(reduced = false) {
  const check = (ok: unknown, message: string) => { if (!ok) throw new Error(message) }
  const host = document.body.appendChild(document.createElement('div'))
  const root = createRoot(host)
  const originalRender = Renderer.prototype.render
  const originalContext = HTMLCanvasElement.prototype.getContext
  const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden')
  const nextFrame = () => new Promise(requestAnimationFrame)
  let renders = 0
  Renderer.prototype.render = function(options) {
    if (host.contains(this.gl.canvas)) renders++
    return originalRender.call(this, options)
  }
  const restoreVisibility = () => {
    if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor)
    else Reflect.deleteProperty(document, 'hidden')
    document.dispatchEvent(new Event('visibilitychange'))
  }
  try {
    flushSync(() => root.render(<Galaxy />))
    await nextFrame(); await nextFrame()
    const canvas = host.querySelector('canvas')
    check(canvas && canvas.width <= 1440 && canvas.height > 0, 'Galaxy must render with bounded resolution')
    check(getComputedStyle(host.firstElementChild!).pointerEvents === 'none', 'Galaxy must not intercept clicks')
    let before = renders
    await nextFrame(); await nextFrame()
    check(reduced ? renders === before : renders > before, 'Galaxy must honor reduced motion')
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    before = renders
    await nextFrame(); await nextFrame()
    check(renders === before, 'Hidden tabs must stop rendering')
    restoreVisibility()
    check(renders > before, 'Returning to a visible tab must redraw')
    flushSync(() => root.render(null))
    before = renders
    await nextFrame(); await nextFrame()
    check(!host.querySelector('canvas') && renders === before, 'Unmount must remove canvas and stop rendering')
    HTMLCanvasElement.prototype.getContext = () => { throw new Error('WebGL unavailable for fallback check') }
    flushSync(() => root.render(<Galaxy />))
    check(host.querySelector('.galaxy-background') && !host.querySelector('canvas'), 'WebGL failure must leave the page usable')
    return `Galaxy checks passed (reduced motion: ${reduced})`
  } finally {
    root.unmount()
    host.remove()
    HTMLCanvasElement.prototype.getContext = originalContext
    Renderer.prototype.render = originalRender
    restoreVisibility()
  }
}

export async function runGalaxyFailureChecks() {
  const host = document.body.appendChild(document.createElement('div'))
  const root = createRoot(host)
  const originalRender = Renderer.prototype.render
  let failures = 0
  let context: Renderer['gl'] | undefined
  Renderer.prototype.render = function(options) {
    if (host.contains(this.gl.canvas)) {
      context = this.gl
      failures++
      throw new Error('Simulated shader/draw failure')
    }
    return originalRender.call(this, options)
  }
  try {
    flushSync(() => root.render(<Galaxy />))
    if (!host.querySelector('.galaxy-background') || host.querySelector('canvas')) throw new Error('Drawing failure must fall back without unmounting the component')
    if (!context?.isContextLost()) throw new Error('Failed initialization must release its WebGL context')
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    if (failures !== 1) throw new Error('Failed drawing must not leave an animation loop running')
    return 'Galaxy drawing failure: fallback and resource cleanup passed'
  } finally {
    root.unmount()
    host.remove()
    Renderer.prototype.render = originalRender
  }
}
