import { describe, it, expect } from 'vitest'
import { placeBubble } from './place-bubble'

const bubble = { width: 300, height: 120 }
const viewport = { width: 1200, height: 800 }

describe('placeBubble', () => {
  it('zet de uitleg onder de afkorting als daar ruimte is', () => {
    const term = { top: 100, left: 400, width: 40, height: 24 }

    expect(placeBubble(term, bubble, viewport)).toEqual({ top: 134, left: 400, side: 'below', arrow: 20 })
  })

  it('zet de uitleg boven de afkorting als hij eronder niet past', () => {
    const term = { top: 700, left: 400, width: 40, height: 24 }

    expect(placeBubble(term, bubble, viewport)).toMatchObject({ top: 570, side: 'above' })
  })

  it('blijft onder de afkorting als hij erboven ook niet past', () => {
    const term = { top: 60, left: 400, width: 40, height: 24 }

    expect(placeBubble(term, bubble, { width: 1200, height: 200 })).toMatchObject({ top: 94, side: 'below' })
  })

  it('houdt de uitleg binnen beeld', () => {
    const atRightEdge = { top: 100, left: 1150, width: 40, height: 24 }
    const onSmallScreen = { top: 100, left: 20, width: 40, height: 24 }

    expect(placeBubble(atRightEdge, bubble, viewport).left).toBe(892)
    expect(placeBubble(onSmallScreen, bubble, { width: 280, height: 600 }).left).toBe(8)
  })

  it('laat het pijltje naar de afkorting wijzen, ook als de uitleg is verschoven', () => {
    const atRightEdge = { top: 100, left: 1150, width: 40, height: 24 }
    const shortWord = { top: 100, left: 400, width: 12, height: 24 }

    expect(placeBubble(atRightEdge, bubble, viewport).arrow).toBe(278)
    expect(placeBubble(shortWord, bubble, viewport).arrow).toBe(16)
  })
})
