import { Component, Element, Event, EventEmitter, Listen, Method, State, h } from '@stencil/core'
import { Box, placePanel } from '../../utils/place-panel'

const SPOTLIGHT_PADDING = 8

/**
 * Een rondleiding die stap voor stap uitlegt wat er op een pagina staat.
 * Zet de stappen als `guided-tour-step` in het component en start de rondleiding met `start()`.
 *
 * @slot - De `guided-tour-step`-elementen
 */
@Component({
  tag: 'guided-tour',
  styleUrl: 'guided-tour.css',
  shadow: true
})
export class GuidedTour {
  @Element() el!: HTMLGuidedTourElement

  @State() index = 0
  @State() announcement = ''

  /** Gaat af als er een stap in beeld komt, met het nummer van de stap (vanaf 0) */
  @Event() tourStep!: EventEmitter<number>

  /** Gaat af als de rondleiding sluit: `true` als hij is afgemaakt, `false` als hij eerder is gesloten */
  @Event() tourEnd!: EventEmitter<boolean>

  private dialog!: HTMLDialogElement
  private panel!: HTMLElement
  private spotlight!: HTMLElement
  private nextButton!: HTMLButtonElement
  private returnFocus: HTMLElement | null = null
  private completed = false
  private scrolledTo = -1
  private frame = 0

  /** Start de rondleiding, bij de eerste stap of bij de stap die je meegeeft */
  @Method()
  async start(step = 0) {
    if (this.dialog.open || !this.steps[step]) return

    this.returnFocus = document.activeElement as HTMLElement | null
    this.completed = false
    this.scrolledTo = -1
    this.announcement = ''
    this.show(step)

    // showModal maakt de rest van de pagina inert en sluit met Escape
    this.dialog.showModal()
    this.nextButton.focus()
  }

  /** Sluit de rondleiding */
  @Method()
  async end() {
    this.dialog.close()
  }

  @Listen('resize', { target: 'window' })
  @Listen('scroll', { target: 'window' })
  onViewportChange() {
    if (!this.dialog?.open) return
    cancelAnimationFrame(this.frame)
    this.frame = requestAnimationFrame(() => this.position())
  }

  componentDidRender() {
    if (this.dialog?.open) this.position()
  }

  private get steps(): HTMLGuidedTourStepElement[] {
    return Array.from(this.el.querySelectorAll('guided-tour-step'))
  }

  private show(index: number) {
    this.index = index
    this.steps.forEach((step, i) => (step.active = i === index))
    this.tourStep.emit(index)
  }

  private announce() {
    const steps = this.steps
    this.announcement = `Stap ${this.index + 1} van ${steps.length}: ${steps[this.index].heading}`
  }

  private next = () => {
    if (this.index === this.steps.length - 1) {
      this.completed = true
      this.dialog.close()
      return
    }
    this.show(this.index + 1)
    this.announce()
  }

  private previous = () => {
    // De knop Vorige verdwijnt bij de eerste stap, dus geef de focus aan Volgende
    if (this.index === 1) this.nextButton.focus()
    this.show(this.index - 1)
    this.announce()
  }

  private onClose = () => {
    this.steps.forEach((step) => (step.active = false))
    this.tourEnd.emit(this.completed)
    this.returnFocus?.focus()
  }

  private position() {
    const step = this.steps[this.index]
    const target = step?.target ? document.querySelector<HTMLElement>(step.target) : null

    if (target && this.scrolledTo !== this.index) {
      this.scrolledTo = this.index
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
    }

    const rect = target?.getBoundingClientRect()
    const spot: Box | null = rect
      ? {
          top: rect.top - SPOTLIGHT_PADDING,
          left: rect.left - SPOTLIGHT_PADDING,
          width: rect.width + SPOTLIGHT_PADDING * 2,
          height: rect.height + SPOTLIGHT_PADDING * 2
        }
      : null

    // Zonder target krimpt de spotlight tot een punt in het midden, zodat de overlay het hele scherm bedekt
    const box = spot ?? { top: innerHeight / 2, left: innerWidth / 2, width: 0, height: 0 }
    Object.assign(this.spotlight.style, {
      top: `${box.top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${box.height}px`
    })

    const { width, height } = this.panel.getBoundingClientRect()
    const { top, left } = placePanel(spot, { width, height }, { width: innerWidth, height: innerHeight })
    this.panel.style.top = `${top}px`
    this.panel.style.left = `${left}px`
  }

  render() {
    const steps = this.steps
    const isLast = this.index === steps.length - 1

    return (
      <dialog ref={(el) => (this.dialog = el!)} aria-labelledby="heading" onClose={this.onClose}>
        <div class="spotlight" ref={(el) => (this.spotlight = el!)} />

        <div class="panel" ref={(el) => (this.panel = el!)}>
          <button type="button" class="close" aria-label="Rondleiding sluiten" onClick={() => this.end()}>
            <span aria-hidden="true">×</span>
          </button>

          <p class="progress">
            Stap {this.index + 1} van {steps.length}
          </p>
          <h2 id="heading">{steps[this.index]?.heading}</h2>
          <slot />

          <div class="actions">
            {this.index > 0 && (
              <button key="previous" type="button" onClick={this.previous}>
                Vorige
              </button>
            )}
            <button key="next" type="button" class="primary" ref={(el) => (this.nextButton = el!)} onClick={this.next}>
              {isLast ? 'Klaar' : 'Volgende'}
            </button>
          </div>
        </div>

        <p class="visually-hidden" aria-live="polite">
          {this.announcement}
        </p>
      </dialog>
    )
  }
}
