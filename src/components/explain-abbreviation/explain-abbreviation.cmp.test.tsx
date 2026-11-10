import { render, h, describe, it, expect, beforeEach } from '@stencil/vitest'
import { userEvent } from 'vitest/browser'
import axe from 'axe-core'

async function renderTerms() {
  const result = await render(
    <p>
      Je hebt recht op{' '}
      <explain-abbreviation stands-for="Werkloosheidswet" definition="Een uitkering als je werkloos wordt." href="#ww">
        WW
      </explain-abbreviation>{' '}
      of op de <explain-abbreviation stands-for="Wet werk en inkomen naar arbeidsvermogen">WIA</explain-abbreviation>.
    </p>
  )
  await result.waitForChanges()

  const [ww, wia] = Array.from(result.root.querySelectorAll('explain-abbreviation')).map((term) => {
    const shadow = term.shadowRoot!
    return {
      term,
      shadow,
      button: shadow.querySelector('button')!,
      bubble: shadow.querySelector<HTMLElement>('.bubble')!,
      link: shadow.querySelector('a'),
      live: shadow.querySelector('[aria-live]')!
    }
  })

  return { ...result, ww, wia }
}

const isOpen = (bubble: HTMLElement) => bubble.matches(':popover-open')

describe('explain-abbreviation', () => {
  beforeEach(() => sessionStorage.clear())

  it('opent de uitleg als je op de afkorting klikt en leest hem voor', async () => {
    const { ww, waitForChanges } = await renderTerms()

    expect(ww.button).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(ww.button)
    await waitForChanges()

    expect(isOpen(ww.bubble)).toBe(true)
    expect(ww.bubble).toHaveTextContent('WWWerkloosheidswetEen uitkering als je werkloos wordt.Lees meer over WW →')
    expect(ww.button).toHaveAttribute('aria-expanded', 'true')
    expect(ww.live).toHaveTextContent('WW: Werkloosheidswet. Een uitkering als je werkloos wordt.')
  })

  it('werkt met het toetsenbord en sluit met Escape', async () => {
    const { ww, waitForChanges } = await renderTerms()

    ww.button.focus()
    await userEvent.keyboard('{Enter}')
    await waitForChanges()
    expect(isOpen(ww.bubble)).toBe(true)

    await userEvent.keyboard('{Escape}')
    await waitForChanges()

    expect(isOpen(ww.bubble)).toBe(false)
    expect(ww.button).toHaveAttribute('aria-expanded', 'false')
    expect(ww.live).toHaveTextContent('')
    expect(ww.shadow.activeElement).toBe(ww.button)
  })

  it('gaat met Tab naar de link en sluit als de focus verder gaat', async () => {
    const { ww, wia, waitForChanges } = await renderTerms()

    ww.button.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()
    await waitForChanges()

    expect(ww.shadow.activeElement).toBe(ww.link)
    expect(isOpen(ww.bubble)).toBe(true)

    await userEvent.tab()
    await waitForChanges()

    expect(wia.shadow.activeElement).toBe(wia.button)
    expect(isOpen(ww.bubble)).toBe(false)
  })

  it('heeft maar één uitleg tegelijk open', async () => {
    const { ww, wia, waitForChanges } = await renderTerms()

    await userEvent.click(ww.button)
    await userEvent.click(wia.button)
    await waitForChanges()

    expect(isOpen(ww.bubble)).toBe(false)
    expect(isOpen(wia.bubble)).toBe(true)
  })

  it('staat al in het eerste frame op zijn plek', async () => {
    const { ww } = await renderTerms()

    ww.shadow.addEventListener('toggle', (event) => event.stopPropagation(), { capture: true, once: true })
    ww.button.click()
    await new Promise(requestAnimationFrame)

    const gap = ww.bubble.getBoundingClientRect().top - ww.term.getBoundingClientRect().bottom
    expect(Math.abs(gap)).toBeLessThan(16)
    expect(ww.bubble.dataset.side).toBe('below')
  })

  it('geeft een Engelse uitleg de juiste taal voor de screenreader', async () => {
    const { root, waitForChanges } = await render(
      <explain-abbreviation stands-for="User experience" stands-for-lang="en">
        UX
      </explain-abbreviation>
    )
    await waitForChanges()

    expect(root.shadowRoot!.querySelector('.stands-for')).toHaveAttribute('lang', 'en')
  })

  it('zegt welke afkorting is geopend', async () => {
    const { wia, spyOnEvent } = await renderTerms()
    const openSpy = spyOnEvent('abbreviationOpen')

    await userEvent.click(wia.button)

    await expect.poll(() => openSpy.events.length).toBe(1)
    expect(openSpy).toHaveReceivedEventDetail('WIA')
  })

  it('onthoudt welke afkortingen je al hebt bekeken', async () => {
    const { ww, wia, waitForChanges } = await renderTerms()

    await userEvent.click(ww.button)
    await waitForChanges()

    expect(ww.term).toHaveAttribute('seen')
    expect(wia.term).not.toHaveAttribute('seen')
    expect(ww.button).toHaveAccessibleName('WW (uitleg, bekeken)')

    const again = await renderTerms()
    expect(again.ww.term).toHaveAttribute('seen')
    expect(again.wia.term).not.toHaveAttribute('seen')
  })

  it('vergeet wat je een eerdere dag hebt bekeken', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    sessionStorage.setItem('explain-abbreviation:WW', yesterday)

    const { ww } = await renderTerms()
    expect(ww.term).not.toHaveAttribute('seen')
  })

  it('heeft geen toegankelijkheidsfouten', async () => {
    const { ww, waitForChanges } = await renderTerms()
    const wcag = { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }

    expect((await axe.run(document, wcag)).violations).toEqual([])

    await userEvent.click(ww.button)
    await waitForChanges()
    await Promise.all(ww.bubble.getAnimations().map((animation) => animation.finished))
    expect((await axe.run(document, wcag)).violations).toEqual([])
  })
})
