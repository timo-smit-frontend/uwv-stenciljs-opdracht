export type Box = { top: number; left: number; width: number; height: number }
export type Size = { width: number; height: number }

const MARGIN = 16

/**
 * Waar het venster van een stap komt: onder het target als het past, anders erboven,
 * en nooit buiten beeld. Zonder target komt het midden in beeld.
 */
export function placePanel(target: Box | null, panel: Size, viewport: Size, gap = 12): { top: number; left: number } {
  if (!target) {
    return {
      top: clamp((viewport.height - panel.height) / 2, MARGIN, viewport.height - panel.height - MARGIN),
      left: clamp((viewport.width - panel.width) / 2, MARGIN, viewport.width - panel.width - MARGIN)
    }
  }

  const below = target.top + target.height + gap
  const above = target.top - gap - panel.height
  const fitsBelow = below + panel.height <= viewport.height - MARGIN
  const top = fitsBelow || above < MARGIN ? below : above
  const left = target.left + target.width / 2 - panel.width / 2

  return {
    top: clamp(top, MARGIN, viewport.height - panel.height - MARGIN),
    left: clamp(left, MARGIN, viewport.width - panel.width - MARGIN)
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}
