export type Box = { top: number; left: number; width: number; height: number }
export type Size = { width: number; height: number }
export type Placement = { top: number; left: number; side: 'above' | 'below'; arrow: number }

const MARGIN = 8
const GAP = 10
const ARROW_EDGE = 16

export function placeBubble(term: Box, bubble: Size, viewport: Size): Placement {
  const below = term.top + term.height + GAP
  const above = term.top - GAP - bubble.height
  const fitsBelow = below + bubble.height <= viewport.height - MARGIN
  const side = !fitsBelow && above >= MARGIN ? 'above' : 'below'
  const left = clamp(term.left, MARGIN, viewport.width - bubble.width - MARGIN)

  return {
    top: side === 'above' ? above : below,
    left,
    side,
    arrow: clamp(term.left + term.width / 2 - left, ARROW_EDGE, bubble.width - ARROW_EDGE)
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}
