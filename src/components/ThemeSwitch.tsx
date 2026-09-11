import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { applyTheme, parseTheme, readTheme, themeKey, themes } from '@/lib/theme'

export default function ThemeSwitch() {
  const [theme, setTheme] = useState(readTheme)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => applyTheme(theme)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [theme])
  const Icon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun
  return <div className="theme-switch">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`主题：${themes[theme]}`} title={`主题：${themes[theme]}`}><Icon size={18} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="engine-menu">
        <DropdownMenuRadioGroup value={theme} onValueChange={value => {
          const next = parseTheme(value)
          setTheme(next)
          try { localStorage.setItem(themeKey, next) } catch { /* Theme still works without storage. */ }
        }}>
          {Object.entries(themes).map(([value, label]) => <DropdownMenuRadioItem key={value} value={value} className="theme-option">{label}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
}
