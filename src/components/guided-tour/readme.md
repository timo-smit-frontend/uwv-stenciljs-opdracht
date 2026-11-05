# guided-tour



<!-- Auto Generated Below -->


## Overview

Een rondleiding die stap voor stap uitlegt wat er op een pagina staat.
Zet de stappen als `guided-tour-step` in het component en start de rondleiding met `start()`.

## Events

| Event      | Description                                                                                       | Type                   |
| ---------- | ------------------------------------------------------------------------------------------------- | ---------------------- |
| `tourEnd`  | Gaat af als de rondleiding sluit: `true` als hij is afgemaakt, `false` als hij eerder is gesloten | `CustomEvent<boolean>` |
| `tourStep` | Gaat af als er een stap in beeld komt, met het nummer van de stap (vanaf 0)                       | `CustomEvent<number>`  |


## Methods

### `end() => Promise<void>`

Sluit de rondleiding

#### Returns

Type: `Promise<void>`



### `start(step?: number) => Promise<void>`

Start de rondleiding, bij de eerste stap of bij de stap die je meegeeft

#### Parameters

| Name   | Type     | Description |
| ------ | -------- | ----------- |
| `step` | `number` |             |

#### Returns

Type: `Promise<void>`




## Slots

| Slot | Description                     |
| ---- | ------------------------------- |
|      | De `guided-tour-step`-elementen |


## CSS Custom Properties

| Name                       | Description                               |
| -------------------------- | ----------------------------------------- |
| `--guided-tour-accent`     | Kleur van de hoofdknop en de focusrand    |
| `--guided-tour-background` | Achtergrond van het venster               |
| `--guided-tour-color`      | Tekstkleur van het venster                |
| `--guided-tour-overlay`    | Kleur over de rest van de pagina          |
| `--guided-tour-radius`     | Afronding van het venster en de spotlight |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
