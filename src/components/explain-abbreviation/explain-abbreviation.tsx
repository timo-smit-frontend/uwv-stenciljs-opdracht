import { Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core'
import { placeBubble } from '../../utils/place-bubble'

const storageKey = (abbreviation: string) => `explain-abbreviation:${abbreviation}`
const today = () => new Date().toDateString()

function isRemembered(abbreviation: string) {
  try {
    return sessionStorage.getItem(storageKey(abbreviation)) === today()
  } catch {
    return false
  }
}

function remember(abbreviation: string) {
  try {
    sessionStorage.setItem(storageKey(abbreviation), today())
  } catch {}
}

@Component({
  tag: 'explain-abbreviation',
  styleUrl: 'explain-abbreviation.css',
  shadow: true
})
export class ExplainAbbreviation {
  @Element() el!: HTMLExplainAbbreviationElement

  @Prop() standsFor?: string
  @Prop() standsForLang?: string
  @Prop() definition?: string
  @Prop() href?: string
  @Prop({ mutable: true, reflect: true }) seen = false

  @State() open = false

  @Event() abbreviationOpen!: EventEmitter<string>

  private button!: HTMLButtonElement
  private bubble!: HTMLElement
  private frame = 0

  componentWillLoad() {
    this.seen ||= isRemembered(this.abbreviation)
  }

  @Listen('resize', { target: 'window' })
  @Listen('scroll', { target: 'window' })
  onViewportChange() {
    if (!this.open) return
    cancelAnimationFrame(this.frame)
    this.frame = requestAnimationFrame(() => this.position())
  }

  @Listen('focusout')
  onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (this.open && next && !this.el.contains(next)) this.bubble.hidePopover()
  }

  @Listen('abbreviationOpen', { target: 'document' })
  onAbbreviationOpen(event: CustomEvent<string>) {
    if (event.detail !== this.abbreviation) return
    this.seen = true
    remember(this.abbreviation)
  }

  private get abbreviation() {
    return this.el.textContent?.trim() ?? ''
  }

  private onBeforeToggle = (event: ToggleEvent) => {
    this.open = event.newState === 'open'
    if (!this.open) return
    requestAnimationFrame(() => this.position())
    this.abbreviationOpen.emit(this.abbreviation)
  }

  private position() {
    const { top, left, side, arrow } = placeBubble(this.button.getBoundingClientRect(), this.bubble.getBoundingClientRect(), {
      width: innerWidth,
      height: innerHeight
    })
    this.bubble.style.top = `${top}px`
    this.bubble.style.left = `${left}px`
    this.bubble.style.setProperty('--arrow', `${arrow}px`)
    this.bubble.dataset.side = side
  }

  render() {
    const { abbreviation, standsFor, standsForLang, definition, href } = this

    return [
      <button type="button" popoverTarget="bubble" aria-expanded={this.open ? 'true' : 'false'} ref={(el) => (this.button = el!)}>
        <slot />
        <span class="visually-hidden">{this.seen ? ' (uitleg, bekeken)' : ' (uitleg)'}</span>
      </button>,

      '⁠',

      <span id="bubble" class="bubble" popover="auto" ref={(el) => (this.bubble = el!)} onBeforeToggle={this.onBeforeToggle}>
        <span class="title">
          <span class="abbreviation">{abbreviation}</span>
          {standsFor && (
            <span class="stands-for" lang={standsForLang}>
              {standsFor}
            </span>
          )}
        </span>
        {definition && <span class="definition">{definition}</span>}
        {href && (
          <a href={href}>
            Lees meer over {abbreviation}
            <span aria-hidden="true"> →</span>
          </a>
        )}
      </span>,

      <span class="visually-hidden" aria-live="polite">
        {this.open && (
          <span>
            {abbreviation}: {standsFor && <span lang={standsForLang}>{standsFor}. </span>}
            {definition}
          </span>
        )}
      </span>
    ]
  }
}
