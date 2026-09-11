import { useEffect, useState } from 'react'

const dateFormat = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
const timeFormat = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })

export default function DateTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return <time className="date-time" dateTime={now.toISOString()}>
    <span className="date-time-clock">{timeFormat.format(now)}</span>
    <span className="date-time-date">{dateFormat.format(now)}</span>
  </time>
}
