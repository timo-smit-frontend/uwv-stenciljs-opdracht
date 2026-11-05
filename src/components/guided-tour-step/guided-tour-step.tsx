import { Component, Prop, h } from '@stencil/core'

/**
 * Eén stap van een `guided-tour`. De inhoud van het element is de tekst van de stap.
 */
@Component({
  tag: 'guided-tour-step',
  styleUrl: 'guided-tour-step.css',
  shadow: true
})
export class GuidedTourStep {
  /** Kop van de stap */
  @Prop() heading!: string

  /** CSS-selector van het element waar de stap naar wijst. Zonder target staat de stap midden in beeld. */
  @Prop() target?: string

  /** Zet `guided-tour` op de stap die in beeld is */
  @Prop({ reflect: true }) active = false

  render() {
    return <slot />
  }
}
