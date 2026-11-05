import { describe, it, expect } from 'vitest'
import { placePanel } from './place-panel'

const panel = { width: 300, height: 200 }
const viewport = { width: 1200, height: 800 }

describe('placePanel', () => {
  it('zet het venster onder het target als daar ruimte is', () => {
    const target = { top: 100, left: 450, width: 300, height: 50 }

    expect(placePanel(target, panel, viewport)).toEqual({ top: 162, left: 450 })
  })

  it('zet het venster boven het target als het eronder niet past', () => {
    const target = { top: 600, left: 450, width: 300, height: 50 }

    expect(placePanel(target, panel, viewport)).toEqual({ top: 388, left: 450 })
  })

  it('houdt het venster binnen beeld', () => {
    const atLeftEdge = { top: 100, left: 0, width: 40, height: 40 }
    const atRightEdge = { top: 100, left: 1180, width: 20, height: 40 }

    expect(placePanel(atLeftEdge, panel, viewport).left).toBe(16)
    expect(placePanel(atRightEdge, panel, viewport).left).toBe(884)
  })

  it('zet het venster midden in beeld zonder target', () => {
    expect(placePanel(null, panel, viewport)).toEqual({ top: 300, left: 450 })
  })
})
