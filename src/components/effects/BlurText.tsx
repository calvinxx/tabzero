// Adapted from React Bits BlurText; see THIRD_PARTY_NOTICES.md.
import { motion, useReducedMotion } from 'motion/react'

export default function BlurText({ text }: { text: string }) {
  const reduced = useReducedMotion()
  return <motion.span
    initial={reduced ? false : { opacity: 0, filter: 'blur(6px)', y: 6 }}
    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
    transition={{ duration: reduced ? 0 : 0.35 }}
    style={{ display: 'inline-block' }}
  >{text}</motion.span>
}
