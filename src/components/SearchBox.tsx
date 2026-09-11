import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, ChevronDown, Search } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Magnet from '@/components/effects/Magnet'
import { engines, isEngine, matchBookmarks, searchDestination, storageKey, type Engine } from '@/lib/search'

import bookmarks from '@/bookmarks.json'
import { Favicon } from '@/components/LinkCard'

export default function SearchBox() {
  const [engine, setEngine] = useState<Engine>(() => {
    try { const saved = localStorage.getItem(storageKey); return isEngine(saved) ? saved : 'google' }
    catch { return 'google' }
  })
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [active, setActive] = useState(-1)
  const matches = matchBookmarks(bookmarks, query)
  const expanded = suggesting && matches.length > 0
  const input = useRef<HTMLInputElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.defaultPrevented) return
      if (target instanceof HTMLElement && (target.closest('input, textarea, select, [role="menu"]') || target.isContentEditable)) return
      event.preventDefault()
      input.current?.focus()
    }
    document.addEventListener('keydown', focusSearch)
    return () => document.removeEventListener('keydown', focusSearch)
  }, [])
  function selectEngine(value: Engine) {
    setEngine(value)
    try { localStorage.setItem(storageKey, value) } catch { /* Search stays usable when storage is disabled. */ }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const destination = expanded && active >= 0 ? matches[active]?.url : searchDestination(query, engine)
      if (destination) window.open(destination, '_blank', 'noopener,noreferrer')
      setSuggesting(false)
      setActive(-1)
    } catch (cause) { setError((cause as Error).message); input.current?.focus() }
  }
  return <div className="search-area">
    <form role="search" aria-label="网页搜索" className="search-shell" onSubmit={submit}>
      <Search className="search-icon" size={21} aria-hidden="true" />
      <Input ref={input} className="search-input" name="q" aria-label="搜索或输入网址" placeholder="搜索，或输入网址" autoComplete="off" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? 'search-error' : undefined} value={query}
        role="combobox" aria-autocomplete="list" aria-expanded={expanded}
        aria-controls={expanded ? 'bookmark-results' : undefined}
        aria-activedescendant={expanded && active >= 0 ? `bookmark-result-${active}` : undefined}
        onChange={event => { setQuery(event.target.value); setError(''); setActive(-1); setSuggesting(true) }}
        onFocus={() => setSuggesting(true)}
        onBlur={() => { setSuggesting(false); setActive(-1) }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing || event.keyCode === 229) {
            if (event.key === 'Enter') event.preventDefault()
            return
          }
          if (event.key === 'Escape') { setSuggesting(false); setActive(-1); return }
          if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
            event.preventDefault()
            setSuggesting(true)
            setActive(event.key === 'ArrowDown' ? (active + 1) % matches.length : active <= 0 ? matches.length - 1 : active - 1)
          }
        }} />
      <Magnet padding={8} magnetStrength={12} disabled={Boolean(reduced)} wrapperClassName="engine-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="engine-button" aria-label={`搜索引擎：${engines[engine].name}`}><span className="engine-mark" aria-hidden="true">{engines[engine].mark}</span><span className="engine-name">{engines[engine].name}</span><ChevronDown size={14} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="engine-menu">
            {(Object.keys(engines) as Engine[]).map(key => <DropdownMenuItem key={key} onSelect={() => selectEngine(key)} className="engine-option"><span className="engine-mark" aria-hidden="true">{engines[key].mark}</span>{engines[key].name}{engine === key && <Check size={15} className="ml-auto" aria-label="已选择" />}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </Magnet>
      <Button className="search-submit" type="submit" size="icon" aria-label="搜索或前往网址"><ArrowRight size={20} /></Button>
    </form>
    {expanded && <ul id="bookmark-results" role="listbox" aria-label="匹配书签" className="bookmark-results">
      {matches.map((link, index) => <li key={`${link.group}:${link.url}`} id={`bookmark-result-${index}`} role="option" aria-selected={active === index}
        className="bookmark-result" onPointerDown={event => event.preventDefault()}
        onClick={() => { window.open(link.url, '_blank', 'noopener,noreferrer'); setSuggesting(false); setActive(-1) }}>
        <Favicon link={link} /><span className="result-name">{link.name}</span><span className="result-group">{link.group}</span>
      </li>)}
    </ul>}
    {error && <p id="search-error" role="alert" className="search-error">{error}</p>}
  </div>
}
