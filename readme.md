# guided-tour

Een rondleiding als webcomponent: stap voor stap uitleggen wat er op een pagina staat, met een spotlight op het onderdeel waar het over gaat.

## Waarom dit component

Bij mijn huidige werk lever ik websites op en geef ik klanten een training in het CMS. Daar merk ik elke keer hoe belangrijk het is dat iemand zijn weg vindt in iets wat een ander heeft gebouwd. Dit component doet wat ik in zo'n training doe: laten zien waar alles zit.

Een rondleiding lijkt simpel, maar zit vol dingen die je makkelijk fout doet: focus, toetsenbord, wat een screenreader voorleest en wat er met de rest van de pagina gebeurt. Juist dat maakte het interessant om te bouwen.

## Gebruik

```html
<guided-tour>
  <guided-tour-step heading="Welkom">In een paar stappen laat ik zien waar je alles vindt.</guided-tour-step>
  <guided-tour-step target="#menu" heading="Het menu">Hier wissel je tussen je pagina's en instellingen.</guided-tour-step>
  <guided-tour-step target="#new-page" heading="Een nieuwe pagina">Met deze knop maak je een nieuwe pagina.</guided-tour-step>
</guided-tour>

<script>
  document.querySelector('#start-tour').addEventListener('click', () => {
    document.querySelector('guided-tour').start()
  })
</script>
```

Een stap zonder `target` staat midden in beeld. Met `tourStep` en `tourEnd` weet de pagina waar de gebruiker is en of hij de rondleiding heeft afgemaakt.

Alle properties, methods, events en CSS custom properties staan in de readme van [guided-tour](src/components/guided-tour/readme.md) en [guided-tour-step](src/components/guided-tour-step/readme.md). Stencil maakt die bij elke build.

## Aan de slag

```bash
npm install
npx playwright install chromium   # browser voor de tests
npm start                         # demo op http://localhost:3333
npm test                          # build en draait alle tests
```

## Toegankelijkheid

- De rondleiding is een native `<dialog>` die opent met `showModal()`. De browser maakt de rest van de pagina dan inert, houdt de focus in het venster en sluit het met Escape. Dat hoef ik dus niet zelf na te bouwen.
- Bij openen staat de focus op Volgende. Bij het sluiten gaat de focus terug naar waar je was, bijvoorbeeld de knop die de rondleiding startte.
- De dialog heeft de kop van de stap als naam. Bij een nieuwe stap leest een live region "Stap 2 van 5: Het menu" voor, terwijl de focus op Volgende blijft. Zo klik je snel door zonder steeds opnieuw te hoeven zoeken.
- De knoppen hebben een `key`. Zonder key hergebruikt Stencil bij de tweede stap de knop Volgende als Vorige, en dan staat je focus ineens op de verkeerde knop.
- Met `prefers-reduced-motion` springt de pagina direct naar de stap en bewegen spotlight en venster zonder animatie. In contrastmodus verdwijnt `box-shadow`, dus dan krijgt de spotlight een rand.
- In de tests vindt axe-core geen WCAG 2.2 AA-fouten, ook niet terwijl de rondleiding open staat.

## Keuzes

- **Twee componenten.** De stappen zijn gewone elementen in de pagina. Dat werkt hetzelfde in HTML, React of Angular, en de tekst van een stap blijft gewone content die je kunt opmaken.
- **Positie zonder library.** Waar het venster komt, rekent `placePanel` uit: onder het target als het past, anders erboven, en altijd binnen beeld. Het is een losse functie zonder DOM, dus makkelijk te testen.
- **Geen re-render bij scrollen.** Bij scrollen en resizen zet het component alleen de positie van de spotlight en het venster, één keer per frame.
- **Thema via CSS custom properties**, zoals `--guided-tour-accent` en `--guided-tour-overlay`, zodat het in een design system aan te passen is.
- De teksten van de knoppen zijn nu Nederlands en staan vast in het component. In een design system zou ik die meegeven als property of via vertalingen.

## Tests

- **Unittests** voor `placePanel`.
- **Componenttests** met [@stencil/vitest](https://www.npmjs.com/package/@stencil/vitest) in een echte browser (Chromium via Playwright), zoals de Stencil-starter ze opzet. Ze testen openen, door de stappen gaan, terug gaan, sluiten met Escape en het teruggeven van de focus. In de toegankelijkheidstest draait [axe-core](https://github.com/dequelabs/axe-core) op de WCAG-regels.
