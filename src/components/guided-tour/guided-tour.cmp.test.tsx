import { render, h, describe, it, expect } from '@stencil/vitest'
import { userEvent } from 'vitest/browser'
import axe from 'axe-core'

async function renderTour() {
  const result = await render(
    <div>
      <button id="start">Start</button>
      <nav id="menu">Menu</nav>
      <input id="search" aria-label="Zoeken" />

      <guided-tour>
        <guided-tour-step target="#menu" heading="Het menu">
          Hier vind je alle pagina's.
        </guided-tour-step>
        <guided-tour-step target="#search" heading="Zoeken">
          Zoek een pagina op naam.
        </guided-tour-step>
        <guided-tour-step heading="Klaar">Dat was het.</guided-tour-step>
      </guided-tour>
    </div>
  )
  await result.waitForChanges()

  const tour = result.root.querySelector('guided-tour')!
  const shadow = tour.shadowRoot!
  const startButton = result.root.querySelector<HTMLButtonElement>('#start')!
  const nextButton = () => shadow.querySelector<HTMLButtonElement>('button.primary')!

  return { ...result, tour, shadow, startButton, nextButton }
}

describe('guided-tour', () => {
  it('opent bij de eerste stap en zet de focus in de rondleiding', async () => {
    const { tour, shadow, nextButton, waitForChanges } = await renderTour()

    await tour.start()
    await waitForChanges()

    expect(shadow.querySelector('dialog')!.matches(':modal')).toBe(true)
    expect(shadow.querySelector('.progress')).toHaveTextContent('Stap 1 van 3')
    expect(shadow.querySelector('h2')).toHaveTextContent('Het menu')
    expect(shadow.activeElement).toBe(nextButton())
    expect(tour.querySelector('guided-tour-step[active]')).toHaveTextContent("Hier vind je alle pagina's.")

    await tour.end()
  })

  it('gaat door alle stappen en meldt dat hij is afgemaakt', async () => {
    const { tour, shadow, nextButton, waitForChanges, spyOnEvent } = await renderTour()
    const stepSpy = spyOnEvent('tourStep')
    const endSpy = spyOnEvent('tourEnd')

    await tour.start()
    nextButton().click()
    await waitForChanges()

    expect(shadow.querySelector('h2')).toHaveTextContent('Zoeken')
    expect(shadow.querySelector('[aria-live]')).toHaveTextContent('Stap 2 van 3: Zoeken')
    expect(shadow.activeElement).toBe(nextButton())

    nextButton().click()
    await waitForChanges()

    expect(nextButton()).toHaveTextContent('Klaar')
    expect(stepSpy).toHaveReceivedEventTimes(3)

    nextButton().click()
    await waitForChanges()

    expect(shadow.querySelector('dialog')!.open).toBe(false)
    expect(endSpy).toHaveReceivedEventDetail(true)
  })

  it('gaat terug met Vorige', async () => {
    const { tour, shadow, nextButton, waitForChanges } = await renderTour()

    await tour.start(1)
    await waitForChanges()
    shadow.querySelector<HTMLButtonElement>('.actions button:not(.primary)')!.click()
    await waitForChanges()

    expect(shadow.querySelector('h2')).toHaveTextContent('Het menu')
    expect(shadow.querySelector('.actions button:not(.primary)')).toBeNull()
    expect(shadow.activeElement).toBe(nextButton())

    await tour.end()
  })

  it('sluit met Escape en geeft de focus terug', async () => {
    const { tour, shadow, startButton, waitForChanges, spyOnEvent } = await renderTour()
    const endSpy = spyOnEvent('tourEnd')

    startButton.focus()
    await tour.start()
    await userEvent.keyboard('{Escape}')
    await waitForChanges()

    expect(shadow.querySelector('dialog')!.open).toBe(false)
    expect(endSpy).toHaveReceivedEventDetail(false)
    expect(document.activeElement).toBe(startButton)
  })

  it('heeft geen toegankelijkheidsfouten', async () => {
    const { tour, nextButton, waitForChanges } = await renderTour()
    const wcag = { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }

    await tour.start()
    await waitForChanges()
    expect((await axe.run(document, wcag)).violations).toEqual([])

    nextButton().click()
    await waitForChanges()
    expect((await axe.run(document, wcag)).violations).toEqual([])

    await tour.end()
  })
})
