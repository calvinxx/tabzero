// Adapted from React Bits SplitFlapText for controlled clock updates.
// Source and license: THIRD_PARTY_NOTICES.md.
import { useState } from 'react'
import './SplitFlapText.css'

export default function SplitFlapText({ text }: { text: string }) {
  const [frame, setFrame] = useState({ current: text, previous: text })
  // Keep the previous glyph for its falling flap, without timers or a second clock.
  if (frame.current !== text) setFrame({ current: text, previous: frame.current })

  return <span className="split-flap-text" aria-hidden="true">
    {[...frame.current].map((char, index) => {
      if (char === ':') return <span className="split-flap-text__separator" key={index}>:</span>
      const previous = frame.previous[index] ?? char
      const flipping = previous !== char
      return <span className="split-flap-text__tile" key={`${index}:${char}`}>
        <span className="split-flap-text__half split-flap-text__half--top"><span className="split-flap-text__char">{char}</span></span>
        <span className="split-flap-text__half split-flap-text__half--bottom"><span className="split-flap-text__char">{flipping ? previous : char}</span></span>
        {flipping && <>
          <span className="split-flap-text__flap split-flap-text__flap--front"><span className="split-flap-text__char">{previous}</span></span>
          <span className="split-flap-text__flap split-flap-text__flap--back"><span className="split-flap-text__char">{char}</span></span>
        </>}
      </span>
    })}
  </span>
}
