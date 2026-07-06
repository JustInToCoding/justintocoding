# CV-website — Ontwerp

**Datum:** 2026-07-06
**Status:** Goedgekeurd, klaar voor implementatieplan

## Doel

Een one-page CV-website die functioneert als printbaar, PDF-achtig curriculum vitae.
De pagina wordt uiteindelijk op de eigen website van de gebruiker geplaatst. Belangrijkste eisen:

- A4-formaat, oogt als een vel papier op het scherm.
- Print-media queries: `Ctrl+P` levert een nette, voorspelbare A4-print/PDF op.
- Inhoud eenvoudig te onderhouden (nieuwe werkervaring toevoegen = één datablok).
- Modern en professioneel design.
- Geoptimaliseerd voor SEO en toegankelijkheid (doel: Lighthouse 100 op beide).
- Tweetalig: Nederlands (`/`) en Engels (`/en/`).

## Designkeuzes (vastgesteld tijdens brainstorm)

- **Layout:** kleurband-header over volle breedte (naam, functietitel, foto, contact/links),
  daaronder twee kolommen.
- **Accentkleur:** teal `#0f766e`.
- **Typografie:** volledig sans-serif via system font stack (geen externe fonts).
- **Foto:** ja, profielfoto in de header.
- **Contact/links:** e-mail, GitHub, LinkedIn. Géén telefoonnummer, géén website-link.

## Secties

1. **Header** — naam, functietitel, profielfoto, contact/links (e-mail, GitHub, LinkedIn), taalwissel-knop.
2. **Profiel / samenvatting** — korte introductie.
3. **Werkervaring** — rol, bedrijf, periode, locatie, bulletpoints.
4. **Opleiding** — diploma, instituut, periode.
5. **Vaardigheden** — gegroepeerd (bijv. talen, frameworks, tools).
6. **Projecten** — uitgelicht, met links.
7. **Certificeringen**.
8. **Talen** — met niveau.
9. **Hobby's**.

Verdeling: hoofdkolom = Profiel, Werkervaring, Opleiding, Projecten.
Zijbalk = Vaardigheden, Talen, Certificeringen, Hobby's.

## Architectuur & build

- **Vite** als build-tool en dev-server (HMR tijdens ontwikkelen).
- **`cv-data.json`** is de enige bron van waarheid voor alle inhoud.
- Een **custom Vite-plugin** (via de `transformIndexHtml`-hook) rendert bij dev én build de JSON
  naar echte HTML en injecteert die op een placeholder in de pagina. Output = statische HTML met
  alle content erin, zodat de site volledig werkt zonder client-side JavaScript (goed voor SEO en
  robuustheid).
- **`src/render.js`** bevat pure functies per sectie (bijv. `renderExperience(data, locale)`) die
  HTML-strings teruggeven. Eén functie per sectie — leesbaar en per stuk testbaar.
- Twee vooraf-gerenderde taalversies: `/` (NL) en `/en/` (EN). De taalwissel-knop in de header
  linkt tussen beide.

## Datamodel (`cv-data.json`)

- Taal-neutrale velden (bedrijfsnamen, data, links, skill-namen) = gewone strings.
- Vertaalbare teksten = `{ "nl": "...", "en": "..." }`, zodat beide talen in één bestand
  synchroon blijven.
- Elke sectie is een array van objecten; een item toevoegen = een blok kopiëren en aanpassen.

Voorbeeld:

```json
{
  "profile": { "nl": "Korte intro…", "en": "Short intro…" },
  "experience": [
    {
      "role": "Software Developer",
      "company": "Bedrijf",
      "period": "2023 – heden",
      "location": "Utrecht",
      "bullets": [
        { "nl": "Beschrijving…", "en": "Description…" }
      ]
    }
  ]
}
```

## Styling

- Kleurband-header in teal `#0f766e`.
- Twee-koloms body onder de header (hoofdkolom + zijbalk).
- System sans-serif font stack (snel, privacyvriendelijk, geen externe requests).
- Paginaformaat A4 (210 × 297 mm) met realistische marges; scherm-weergave oogt als papier.
- CSS-variabelen voor kleur en spacing, zodat aanpassen eenvoudig is.

## Beeldverwerking (profielfoto)

- De foto wordt bij de build **verkleind, gecomprimeerd en naar WebP omgezet** (met JPEG-fallback),
  omdat een onverkleinde bronfoto puur laadtijd kost — snelheid en CLS tellen mee voor Lighthouse/SEO.
- **`scripts/process-photo.js`** gebruikt **`sharp`**: leest de bronfoto (`public/photo-src.jpg`) en
  schrijft een verkleinde `public/photo.webp` én `public/photo.jpg`. Dit script draait automatisch
  mee in `npm run build`. Deze aanpak past bij onze string-render-architectuur (de HTML wordt bij de
  build gegenereerd, niet via JS-imports, waardoor import-gebaseerde plugins zoals vite-imagetools
  minder goed passen; `vite-plugin-image-optimizer` comprimeert wel maar verkleint/converteert niet).
- Doelgrootte: ~2× de weergavegrootte in de header (weergave ~140px → bron ~320px breed) voor retina.
- In de HTML: `<picture>` met WebP-bron + JPEG-fallback, **expliciete `width`/`height`** (CLS = 0),
  `loading="eager"` (foto staat bovenaan) en een beschrijvende `alt` (bv. "Profielfoto van [naam]").

## Print (`Ctrl+P`)

- `@media print`: verbergt schermelementen (taalknop, schaduwen, pagina-achtergrond).
- `@page`: exacte A4-marges.
- `print-color-adjust: exact` zodat de teal band en accenten meekomen in de print/PDF.
- `break-inside: avoid` op ervaring-/opleiding-/project-blokken zodat items niet over
  paginagrenzen breken.
- Uitgangspunt: schermweergave ≈ print/PDF-output.

## SEO & toegankelijkheid

- Semantische HTML: `<header>`, `<main>`, `<section>`, `<article>`; correcte kopstructuur met
  precies één `<h1>` (de naam).
- Meta-tags (`title`, `description`), Open Graph, en JSON-LD `Person` structured data.
- `lang`-attribuut per pagina; `hreflang`-links tussen NL en EN.
- WCAG: voldoende kleurcontrast, `alt`-tekst op de foto, zichtbare focus-states,
  `aria-label` op de taalknop, logische tab-volgorde.
- Doel: Lighthouse 100 op SEO en Accessibility.

## Projectstructuur

```
index.html            (NL, met render-placeholder)
en/index.html         (EN, met render-placeholder)
cv-data.json
src/render.js         (render-functies per sectie)
src/style.css
vite.config.js        (custom render-plugin)
scripts/process-photo.js   (sharp: verkleint/comprimeert/converteert de foto)
public/photo-src.jpg  (bron-profielfoto, aangeleverd)
public/photo.webp     (gegenereerd bij build)
public/photo.jpg      (gegenereerde JPEG-fallback)
package.json
```

## Verificatie

- `vite build` draaien en de output-HTML controleren: alle content aanwezig zonder JavaScript.
- Print-preview (`Ctrl+P`) visueel controleren op A4-weergave en paginabreuken.
- Lighthouse-check op SEO en Accessibility.

## Nog aan te leveren door gebruiker (bij implementatie)

- Echte CV-gegevens (naam, functietitel, profieltekst, werkervaring, opleiding, vaardigheden,
  projecten, certificeringen, talen, hobby's, e-mail, GitHub- en LinkedIn-URL) — in beide talen.
- Profielfoto.
```
