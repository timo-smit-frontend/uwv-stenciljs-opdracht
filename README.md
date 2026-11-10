# explain-abbreviation

Uitleg bij een afkorting, als webcomponent. Klik op de afkorting en er verschijnt een korte uitleg onder. Je kunt het op bijna elke pagina gebruiken, ook om een vakterm heen.

**Bekijk de demo:** [timo-smit-frontend.github.io/uwv-stenciljs-opdracht](https://timo-smit-frontend.github.io/uwv-stenciljs-opdracht/)

## Waarom dit component

Voor deze opdracht heb ik me natuurlijk verdiept in UWV. Wat me opviel: jullie houden ontzettend van afkortingen. WW, WIA, WGA, IVA, en dat is nog maar het begin.

Dat herkende ik. Mijn eigen werk zit er ook vol mee: CMD, UX, CMS, SEO. Bij elke website die ik opleverde, legde ik de klant in een training uit wat ze betekenen.

Die combinatie vond ik een mooi uitgangspunt. Dit component zet de uitleg bij de afkorting zelf, zodat je niet naar een begrippenlijst onderaan de pagina hoeft en gewoon verder leest waar je was. En omdat het om een woord in een zin heen staat, kun je het makkelijk op elke pagina gebruiken.

De demo is een pagina over mij, vol afkortingen uit mijn opleiding, mijn werk en mijn leven daarbuiten. Van OTAP bij het koffiezetten tot v.o.n. bij mijn nieuwbouwhuis in Mijdrecht.

## Gebruik

```html
<p>
  Je hebt misschien recht op
  <explain-abbreviation stands-for="Werkloosheidswet" definition="Een uitkering als je werkloos wordt." href="https://www.uwv.nl/nl/ww"
    >WW</explain-abbreviation
  >.
</p>

<p>
  Ik werkte als
  <explain-abbreviation stands-for="User experience" stands-for-lang="en">UX</explain-abbreviation>-designer.
</p>

<script>
  document.addEventListener('abbreviationOpen', (event) => {
    console.log(`Iemand wilde weten wat ${event.detail} betekent`)
  })
</script>
```

- `stands-for` is waar de afkorting voor staat, `definition` legt het uit in gewone woorden. Je kunt ze allebei gebruiken of maar één.
- `stands-for-lang` geef je mee als het voluit in een andere taal is, zoals "User experience" op een Nederlandse pagina.
- Met `href` komt er een link "Lees meer over WW" onder de uitleg.

Met `abbreviationOpen` kan een site bijhouden welke afkortingen mensen opzoeken. Dat zijn de afkortingen die je beter kunt uitschrijven.

Heb je een uitleg geopend, dan krijgt het element het attribuut `seen` en wordt de stippellijn een doorgetrokken lijn, net als een bezochte link. Staat dezelfde afkorting vaker op de pagina, dan is hij overal bekeken. In de demo houdt een teller rechtsonder bij hoeveel afkortingen je al hebt bekeken.

### Attributen

| Attribuut         | Wat het doet                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- |
| `stands-for`      | Waar de afkorting voor staat, bijvoorbeeld "Werkloosheidswet"                         |
| `stands-for-lang` | De taal van `stands-for` als die anders is dan de pagina, bijvoorbeeld "en"           |
| `definition`      | Een korte uitleg in gewone woorden                                                    |
| `href`            | Een link naar een pagina met meer informatie                                          |
| `seen`            | Staat aan als de uitleg al eens is geopend. Blijft bewaard zolang het tabblad open is |

### Event

| Event              | Wat het doet                                                      |
| ------------------ | ----------------------------------------------------------------- |
| `abbreviationOpen` | Gaat af als iemand de uitleg opent, met de afkorting als `detail` |

### CSS custom properties

| Property                             | Wat het doet                                           |
| ------------------------------------ | ------------------------------------------------------ |
| `--explain-abbreviation-accent`      | Kleur van de onderstreping en de focusrand             |
| `--explain-abbreviation-seen-accent` | Kleur van de onderstreping als de uitleg al is bekeken |
| `--explain-abbreviation-background`  | Achtergrond van de uitleg                              |
| `--explain-abbreviation-color`       | Tekstkleur van de uitleg                               |

## Aan de slag

Voor de tests heb je Chromium van Playwright nodig. `npm start` zet de demo op http://localhost:3333, `npm test` bouwt alles en draait de tests.

```bash
npm install
npx playwright install chromium
npm start
npm test
```

## Toegankelijkheid

- De afkorting is een `<button>`, dus het werkt met muis, touch en toetsenbord. Het ziet er nog steeds uit als tekst in de zin, alleen met een stippellijn eronder.
- Het is een toggletip, geen tooltip: de uitleg opent als je klikt, niet als je erover hovert. Hover bestaat niet op een telefoon, en uitleg die verdwijnt als je muis wegschuift is lastig te lezen.
- De uitleg is een native `popover`. De browser sluit hem met Escape of als je ernaast klikt, en er staat altijd maar één uitleg open.
- De focus blijft op de afkorting, zodat je gewoon verder leest. Een live region leest de uitleg voor, en `aria-expanded` laat horen of hij open staat.
- Staat er een link in de uitleg, dan ga je er met Tab naartoe. Tab je verder, dan gaat de uitleg dicht, zodat hij niet over het volgende element heen blijft staan (WCAG 2.4.11).
- Voor een screenreader heet de knop "WW (uitleg)". Dan weet je dat er meer achter het woord zit. Heb je hem al gelezen, dan heet hij "WW (uitleg, bekeken)".
- Bekeken zie je niet alleen aan de kleur, de stippellijn wordt ook een doorgetrokken lijn (WCAG 1.4.1).
- Met `stands-for-lang` krijgt het voluit een eigen `lang`. Een Nederlandse screenreader spreekt "User experience" dan in het Engels uit (WCAG 3.1.2).
- WCAG 2.2 vraagt klikvlakken van minstens 24 bij 24 pixels, maar woorden in een zin zijn daarvan uitgezonderd. Daarom kan de afkorting zo groot blijven als de tekst eromheen. De link in de uitleg is wel 24 pixels hoog.
- In contrastmodus krijgt de uitleg een rand, omdat achtergrond en schaduw dan verdwijnen. Een bekeken afkorting krijgt dan de systeemkleur voor bezochte links.
- Wie minder beweging wil, krijgt de uitleg zonder animatie.
- In de tests vindt axe-core geen WCAG 2.2 AA-fouten, ook niet met de uitleg open. Op de demopagina ook niet.

## Keuzes

- **Attributen in plaats van losse elementen.** Met `stands-for` en `definition` blijft het één element. Zonder JavaScript zie je gewoon de afkorting, en niet een losse uitleg midden in de zin.
- **Op zijn plek vóór de eerste paint.** Het `toggle`-event van een popover kan pas komen nadat de browser al heeft getekend. Dan zag je de uitleg heel even linksboven. Daarom plaatst het component de uitleg bij `beforetoggle`, in een animation frame, en dat draait altijd vóór de paint.
- **Positie zonder library.** Waar de uitleg komt, rekent `placeBubble` uit: onder de afkorting als het past, anders erboven, en altijd binnen beeld. Het pijltje wijst naar het midden van de afkorting, ook als de uitleg is opgeschoven. Het is een losse functie zonder DOM, dus makkelijk te testen.
- **Geen losse punt op de volgende regel.** Een knop is voor de browser een blok in de tekst, en direct daarachter mag hij de regel afbreken. Dan stond de punt na "GSAP." of het streepje in "UI-designer" soms alleen op de volgende regel. Een onzichtbare word joiner (`U+2060`) na de knop alleen was in Chrome niet genoeg. Samen met `white-space: nowrap` op het element gaat het wel goed, en een test controleert dat op allerlei breedtes.
- **Onthouden in `sessionStorage`.** Wat je hebt bekeken, blijft bewaard als je de pagina ververst of naar een andere pagina gaat, maar niet als je het tabblad sluit. Het component slaat ook de datum op, dus de volgende dag begin je opnieuw, ook als het tabblad nog openstaat of de browser het terugzet. Op een gedeelde computer, bijvoorbeeld in een bibliotheek, ziet de volgende dan niet wat jij hebt opgezocht. Kan de browser niets opslaan, dan werkt het component gewoon zonder.
- **Thema via CSS custom properties**, zoals `--explain-abbreviation-accent` en `--explain-abbreviation-background`, zodat het in een design system aan te passen is. De demo geeft de uitleg zo een eigen kleur per sectie.
- Zet het component niet in een link, want een knop in een link mag niet in HTML.
- De teksten "uitleg" en "Lees meer over" staan nu vast in het component. In een design system zou ik die meegeven als property of via vertalingen.

## Tests

- **Unittests** voor `placeBubble`.
- **Componenttests** met [@stencil/vitest](https://www.npmjs.com/package/@stencil/vitest) in een echte browser (Chromium via Playwright). Ze testen openen met de muis en het toetsenbord, sluiten met Escape, met Tab naar de link en weer weg, dat er maar één uitleg open staat, dat hij in het eerste frame al op zijn plek staat, de taal van het voluit, het event `abbreviationOpen` en dat het onthoudt welke afkortingen je hebt bekeken. In de toegankelijkheidstest draait [axe-core](https://github.com/dequelabs/axe-core) op de WCAG-regels.
