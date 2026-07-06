# CV-website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw een tweetalige (NL/EN), printbare A4-CV als statische website; inhoud uit één JSON-bestand, bij de build in de HTML gerenderd via Vite.

**Architecture:** Vite bouwt twee vooraf-gerenderde pagina's (`/` NL, `/en/` EN). Een custom Vite-plugin leest `cv-data.json` en injecteert bij dev én build de gerenderde HTML in placeholders via de `transformIndexHtml`-hook. Pure render-functies in `src/render.js` zetten data om naar HTML-strings en zijn los te unit-testen met Vitest. De profielfoto wordt bij de build door een `sharp`-script verkleind/gecomprimeerd naar WebP + JPEG-fallback.

**Tech Stack:** Vite, Vitest, sharp, vanilla JS (ES modules), semantische HTML + CSS met custom properties.

---

## Bestandsstructuur

- `package.json` — scripts en dependencies
- `vite.config.js` — build-config + custom render-plugin (multi-page input)
- `cv-data.json` — enige bron van waarheid voor alle inhoud (voorbeelddata, later echte data)
- `index.html` — NL-pagina, bevat `<!--CV_HEAD-->` en `<!--CV_BODY-->` placeholders, `lang="nl"`
- `en/index.html` — EN-pagina, idem, `lang="en"`
- `src/render.js` — pure render-functies (`t`, `escapeHtml`, `renderHead`, `renderBody` + sectie-renderers)
- `src/style.css` — alle styling incl. `@media print`
- `scripts/process-photo.js` — sharp-script: verkleint/comprimeert de foto
- `test/render.test.js` — Vitest-tests voor de render-functies
- `public/photo-src.jpg` — bron-profielfoto (later aangeleverd)
- `public/photo.webp`, `public/photo.jpg` — gegenereerd bij build

### Gedeelde interfaces (in alle taken consistent gebruiken)

Datamodel `cv-data.json` (vertaalbare tekst = `{ "nl": "...", "en": "..." }`, taal-neutraal = gewone string):

```json
{
  "meta": {
    "name": "Voornaam Achternaam",
    "title": { "nl": "Software Developer", "en": "Software Developer" },
    "email": "naam@voorbeeld.nl",
    "github": "https://github.com/gebruiker",
    "linkedin": "https://www.linkedin.com/in/gebruiker",
    "location": { "nl": "Utrecht, Nederland", "en": "Utrecht, Netherlands" },
    "siteUrl": "https://www.voorbeeld.nl/cv",
    "photoAlt": { "nl": "Profielfoto van Voornaam Achternaam", "en": "Profile photo of Voornaam Achternaam" }
  },
  "profile": { "nl": "Korte introductie…", "en": "Short introduction…" },
  "experience": [
    { "role": "Software Developer", "company": "Bedrijf BV", "period": "2023 – heden",
      "location": { "nl": "Utrecht", "en": "Utrecht" },
      "bullets": [ { "nl": "Bouwde X…", "en": "Built X…" } ] }
  ],
  "education": [
    { "degree": { "nl": "HBO Informatica", "en": "BSc Computer Science" }, "institution": "Hogeschool Utrecht", "period": "2019 – 2023" }
  ],
  "skills": [
    { "group": { "nl": "Talen", "en": "Languages" }, "items": ["JavaScript", "TypeScript", "Python"] }
  ],
  "projects": [
    { "name": "Projectnaam", "url": "https://github.com/gebruiker/project",
      "description": { "nl": "Beschrijving…", "en": "Description…" } }
  ],
  "certifications": [
    { "name": "AWS Certified Developer", "issuer": "Amazon Web Services", "year": "2024" }
  ],
  "languages": [
    { "name": { "nl": "Nederlands", "en": "Dutch" }, "level": { "nl": "Moedertaal", "en": "Native" } }
  ],
  "hobbies": [ { "nl": "Hardlopen", "en": "Running" } ]
}
```

Function-signatures in `src/render.js` (namen exact zo aanhouden):

- `escapeHtml(value) → string`
- `t(value, locale) → string | array` — geeft `value[locale]` als `value` een `{nl,en}`-object is, anders `value`
- `renderHead(data, locale) → string` — head-meta HTML
- `renderBody(data, locale) → string` — volledige `<header>` + `<main>` HTML
- Sectie-renderers, elk `(slice, locale) → string`: `renderProfile`, `renderExperience`, `renderEducation`, `renderSkills`, `renderProjects`, `renderCertifications`, `renderLanguages`, `renderHobbies`
- Header-renderer: `renderHeader(meta, locale) → string`

Locale-waarden: `"nl"` en `"en"`. Sectietitels komen uit een `LABELS`-constante in `src/render.js`:

```js
export const LABELS = {
  profile:        { nl: "Profiel",         en: "Profile" },
  experience:     { nl: "Werkervaring",    en: "Experience" },
  education:      { nl: "Opleiding",       en: "Education" },
  skills:         { nl: "Vaardigheden",    en: "Skills" },
  projects:       { nl: "Projecten",       en: "Projects" },
  certifications: { nl: "Certificeringen", en: "Certifications" },
  languages:      { nl: "Talen",           en: "Languages" },
  hobbies:        { nl: "Hobby's",         en: "Hobbies" },
  switchLang:     { nl: "English",         en: "Nederlands" },
  switchAria:     { nl: "Schakel naar Engels", en: "Switch to Dutch" }
};
```

---

## Task 1: Projectopzet

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `en/index.html`

- [ ] **Step 1: Init project en installeer dependencies**

Run:
```bash
npm init -y
npm install --save-dev vite vitest
npm install sharp
```
Expected: `node_modules/` en bijgewerkte `package.json`.

- [ ] **Step 2: Zet scripts in `package.json`**

Vervang het `"scripts"`-blok door:
```json
"scripts": {
  "photos": "node scripts/process-photo.js",
  "dev": "vite",
  "build": "npm run photos && vite build",
  "preview": "vite preview",
  "test": "vitest run"
},
"type": "module"
```

- [ ] **Step 3: Maak minimale `index.html` (NL) met placeholders**

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--CV_HEAD-->
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <!--CV_BODY-->
</body>
</html>
```

- [ ] **Step 4: Maak `en/index.html` (EN) — identiek behalve `lang`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--CV_HEAD-->
  <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
  <!--CV_BODY-->
</body>
</html>
```

- [ ] **Step 5: Maak minimale `vite.config.js` met multi-page input**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        en: 'en/index.html',
      },
    },
  },
});
```

- [ ] **Step 6: Maak een leeg `src/style.css` zodat de link niet 404't**

```css
/* styling volgt in latere taken */
```

- [ ] **Step 7: Verifieer dat de dev-build draait**

Run: `npm run build`
Expected: build slaagt, `dist/index.html` en `dist/en/index.html` bestaan (placeholders nog letterlijk aanwezig).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite project with two-language pages"
```

---

## Task 2: Localisatie-helpers en voorbeelddata

**Files:**
- Create: `cv-data.json`
- Create: `src/render.js`
- Test: `test/render.test.js`

- [ ] **Step 1: Schrijf falende tests voor `escapeHtml` en `t`**

```js
// test/render.test.js
import { describe, it, expect } from 'vitest';
import { escapeHtml, t } from '../src/render.js';

describe('escapeHtml', () => {
  it('escapet HTML-tekens', () => {
    expect(escapeHtml('<a href="x">Tom & Jerry</a>'))
      .toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;');
  });
  it('maakt van niet-strings een string', () => {
    expect(escapeHtml(2024)).toBe('2024');
  });
});

describe('t', () => {
  it('kiest de juiste taal uit een {nl,en}-object', () => {
    expect(t({ nl: 'Hallo', en: 'Hello' }, 'en')).toBe('Hello');
  });
  it('laat gewone strings ongemoeid', () => {
    expect(t('JavaScript', 'nl')).toBe('JavaScript');
  });
  it('laat arrays ongemoeid', () => {
    expect(t(['a', 'b'], 'nl')).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Draai de tests, verifieer dat ze falen**

Run: `npm test`
Expected: FAIL — `src/render.js` bestaat nog niet / exports ontbreken.

- [ ] **Step 3: Implementeer `escapeHtml`, `t` en `LABELS` in `src/render.js`**

```js
export const LABELS = {
  profile:        { nl: "Profiel",         en: "Profile" },
  experience:     { nl: "Werkervaring",    en: "Experience" },
  education:      { nl: "Opleiding",       en: "Education" },
  skills:         { nl: "Vaardigheden",    en: "Skills" },
  projects:       { nl: "Projecten",       en: "Projects" },
  certifications: { nl: "Certificeringen", en: "Certifications" },
  languages:      { nl: "Talen",           en: "Languages" },
  hobbies:        { nl: "Hobby's",         en: "Hobbies" },
  switchLang:     { nl: "English",         en: "Nederlands" },
  switchAria:     { nl: "Schakel naar Engels", en: "Switch to Dutch" }
};

export function escapeHtml(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (c) => map[c]);
}

export function t(value, locale) {
  if (value && typeof value === 'object' && !Array.isArray(value) && locale in value) {
    return value[locale];
  }
  return value;
}
```

- [ ] **Step 4: Draai de tests, verifieer dat ze slagen**

Run: `npm test`
Expected: PASS (5 tests).

- [ ] **Step 5: Maak `cv-data.json` met realistische voorbeelddata**

Gebruik exact het datamodel uit "Gedeelde interfaces" hierboven, maar vul minstens 2 werkervaringen (elk 2–3 bullets), 1 opleiding, 3 skill-groepen, 2 projecten, 1 certificering, 2 talen en 3 hobby's in — in zowel NL als EN. Zorg dat alle `{nl,en}`-velden beide talen hebben.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add localization helpers, labels and sample cv-data"
```

---

## Task 3: Sectie-renderers

**Files:**
- Modify: `src/render.js`
- Test: `test/render.test.js`

- [ ] **Step 1: Schrijf falende tests voor de sectie-renderers**

Voeg toe aan `test/render.test.js`:
```js
import {
  renderProfile, renderExperience, renderSkills,
  renderProjects, renderLanguages, renderHobbies
} from '../src/render.js';

describe('renderExperience', () => {
  const exp = [{
    role: 'Dev', company: 'Acme', period: '2023 – heden',
    location: { nl: 'Utrecht', en: 'Utrecht' },
    bullets: [{ nl: 'Deed <X>', en: 'Did <X>' }]
  }];
  it('toont rol, bedrijf, periode en bullets in de juiste taal', () => {
    const html = renderExperience(exp, 'nl');
    expect(html).toContain('Dev');
    expect(html).toContain('Acme');
    expect(html).toContain('2023 – heden');
    expect(html).toContain('Deed &lt;X&gt;'); // ge-escaped
  });
  it('rendert elk item als <article>', () => {
    expect(renderExperience(exp, 'en')).toContain('<article');
  });
});

describe('renderProfile', () => {
  it('rendert de profieltekst in de gekozen taal', () => {
    expect(renderProfile({ nl: 'Hallo', en: 'Hello' }, 'en')).toContain('Hello');
  });
});

describe('renderSkills', () => {
  it('rendert groepsnaam en items', () => {
    const html = renderSkills([{ group: { nl: 'Talen', en: 'Languages' }, items: ['JS'] }], 'nl');
    expect(html).toContain('Talen');
    expect(html).toContain('JS');
  });
});

describe('renderProjects', () => {
  it('rendert een link met naam en href', () => {
    const html = renderProjects([{ name: 'Proj', url: 'https://x.dev', description: { nl: 'a', en: 'b' } }], 'nl');
    expect(html).toContain('href="https://x.dev"');
    expect(html).toContain('Proj');
  });
});

describe('renderHobbies', () => {
  it('rendert alle hobby-items', () => {
    const html = renderHobbies([{ nl: 'Lezen', en: 'Reading' }], 'en');
    expect(html).toContain('Reading');
  });
});
```

- [ ] **Step 2: Draai de tests, verifieer dat ze falen**

Run: `npm test`
Expected: FAIL — renderers nog niet geëxporteerd.

- [ ] **Step 3: Implementeer de sectie-renderers in `src/render.js`**

```js
function sectionTitle(key, locale) {
  return `<h2 class="section__title">${escapeHtml(t(LABELS[key], locale))}</h2>`;
}

export function renderProfile(profile, locale) {
  return `<section class="section" id="profiel">
    ${sectionTitle('profile', locale)}
    <p class="profile">${escapeHtml(t(profile, locale))}</p>
  </section>`;
}

export function renderExperience(experience, locale) {
  const items = experience.map((job) => {
    const bullets = job.bullets
      .map((b) => `<li>${escapeHtml(t(b, locale))}</li>`)
      .join('');
    return `<article class="entry">
      <div class="entry__head">
        <h3 class="entry__role">${escapeHtml(job.role)}</h3>
        <span class="entry__period">${escapeHtml(job.period)}</span>
      </div>
      <div class="entry__meta">${escapeHtml(job.company)} · ${escapeHtml(t(job.location, locale))}</div>
      <ul class="entry__bullets">${bullets}</ul>
    </article>`;
  }).join('');
  return `<section class="section" id="werkervaring">
    ${sectionTitle('experience', locale)}${items}
  </section>`;
}

export function renderEducation(education, locale) {
  const items = education.map((ed) => `<article class="entry">
      <div class="entry__head">
        <h3 class="entry__role">${escapeHtml(t(ed.degree, locale))}</h3>
        <span class="entry__period">${escapeHtml(ed.period)}</span>
      </div>
      <div class="entry__meta">${escapeHtml(ed.institution)}</div>
    </article>`).join('');
  return `<section class="section" id="opleiding">
    ${sectionTitle('education', locale)}${items}
  </section>`;
}

export function renderSkills(skills, locale) {
  const groups = skills.map((g) => {
    const items = g.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');
    return `<div class="skills__group">
      <h3 class="skills__name">${escapeHtml(t(g.group, locale))}</h3>
      <ul class="skills__list">${items}</ul>
    </div>`;
  }).join('');
  return `<section class="section" id="vaardigheden">
    ${sectionTitle('skills', locale)}${groups}
  </section>`;
}

export function renderProjects(projects, locale) {
  const items = projects.map((p) => `<article class="entry">
      <h3 class="entry__role">
        <a href="${escapeHtml(p.url)}" rel="noopener">${escapeHtml(p.name)}</a>
      </h3>
      <p class="entry__desc">${escapeHtml(t(p.description, locale))}</p>
    </article>`).join('');
  return `<section class="section" id="projecten">
    ${sectionTitle('projects', locale)}${items}
  </section>`;
}

export function renderCertifications(certifications, locale) {
  const items = certifications.map((c) => `<li class="cert">
      <span class="cert__name">${escapeHtml(c.name)}</span>
      <span class="cert__meta">${escapeHtml(c.issuer)} · ${escapeHtml(c.year)}</span>
    </li>`).join('');
  return `<section class="section" id="certificeringen">
    ${sectionTitle('certifications', locale)}
    <ul class="cert-list">${items}</ul>
  </section>`;
}

export function renderLanguages(languages, locale) {
  const items = languages.map((l) => `<li class="lang">
      <span class="lang__name">${escapeHtml(t(l.name, locale))}</span>
      <span class="lang__level">${escapeHtml(t(l.level, locale))}</span>
    </li>`).join('');
  return `<section class="section" id="talen">
    ${sectionTitle('languages', locale)}
    <ul class="lang-list">${items}</ul>
  </section>`;
}

export function renderHobbies(hobbies, locale) {
  const items = hobbies.map((h) => `<li>${escapeHtml(t(h, locale))}</li>`).join('');
  return `<section class="section" id="hobbys">
    ${sectionTitle('hobbies', locale)}
    <ul class="hobby-list">${items}</ul>
  </section>`;
}
```

- [ ] **Step 4: Draai de tests, verifieer dat ze slagen**

Run: `npm test`
Expected: PASS (alle tests, inclusief de nieuwe).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add per-section HTML renderers with tests"
```

---

## Task 4: Header, body-assembler en head-renderer

**Files:**
- Modify: `src/render.js`
- Test: `test/render.test.js`

- [ ] **Step 1: Schrijf falende tests voor `renderHeader`, `renderBody` en `renderHead`**

Voeg toe aan `test/render.test.js`:
```js
import { renderHeader, renderBody, renderHead } from '../src/render.js';

const data = {
  meta: {
    name: 'Jane Doe', title: { nl: 'Dev', en: 'Dev' },
    email: 'jane@x.nl', github: 'https://github.com/jane',
    linkedin: 'https://linkedin.com/in/jane',
    location: { nl: 'Utrecht', en: 'Utrecht' },
    siteUrl: 'https://x.nl/cv',
    photoAlt: { nl: 'Foto van Jane', en: 'Photo of Jane' }
  },
  profile: { nl: 'p', en: 'p' }, experience: [], education: [],
  skills: [], projects: [], certifications: [], languages: [], hobbies: []
};

describe('renderHeader', () => {
  it('toont naam als h1 en een mailto-link', () => {
    const html = renderHeader(data.meta, 'nl');
    expect(html).toContain('<h1');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('mailto:jane@x.nl');
  });
  it('gebruikt <picture> met webp + jpg-fallback en alt-tekst', () => {
    const html = renderHeader(data.meta, 'en');
    expect(html).toContain('photo.webp');
    expect(html).toContain('photo.jpg');
    expect(html).toContain('Photo of Jane');
  });
  it('linkt de taalknop naar de andere taal', () => {
    expect(renderHeader(data.meta, 'nl')).toContain('href="/en/"');
    expect(renderHeader(data.meta, 'en')).toContain('href="/"');
  });
});

describe('renderHead', () => {
  it('bevat een title, description, hreflang en JSON-LD Person', () => {
    const html = renderHead(data, 'nl');
    expect(html).toContain('<title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('hreflang="nl"');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('"@type": "Person"');
  });
});

describe('renderBody', () => {
  it('bevat header en main', () => {
    const html = renderBody(data, 'nl');
    expect(html).toContain('<header');
    expect(html).toContain('<main');
  });
});
```

- [ ] **Step 2: Draai de tests, verifieer dat ze falen**

Run: `npm test`
Expected: FAIL — functies nog niet geëxporteerd.

- [ ] **Step 3: Implementeer `renderHeader`, `renderBody` en `renderHead`**

Voeg toe aan `src/render.js`:
```js
export function renderHeader(meta, locale) {
  const switchHref = locale === 'nl' ? '/en/' : '/';
  return `<header class="masthead">
    <div class="masthead__inner">
      <picture class="masthead__photo">
        <source srcset="/photo.webp" type="image/webp" />
        <img src="/photo.jpg" width="140" height="140"
             alt="${escapeHtml(t(meta.photoAlt, locale))}" loading="eager" decoding="async" />
      </picture>
      <div class="masthead__intro">
        <h1 class="masthead__name">${escapeHtml(meta.name)}</h1>
        <p class="masthead__title">${escapeHtml(t(meta.title, locale))}</p>
        <ul class="masthead__contact">
          <li><a href="mailto:${escapeHtml(meta.email)}">${escapeHtml(meta.email)}</a></li>
          <li><a href="${escapeHtml(meta.github)}" rel="noopener">GitHub</a></li>
          <li><a href="${escapeHtml(meta.linkedin)}" rel="noopener">LinkedIn</a></li>
        </ul>
      </div>
      <a class="masthead__lang" href="${switchHref}"
         aria-label="${escapeHtml(t(LABELS.switchAria, locale))}">${escapeHtml(t(LABELS.switchLang, locale))}</a>
    </div>
  </header>`;
}

export function renderBody(data, locale) {
  const { meta } = data;
  return `${renderHeader(meta, locale)}
  <main class="sheet__main">
    <div class="col col--main">
      ${renderProfile(data.profile, locale)}
      ${renderExperience(data.experience, locale)}
      ${renderEducation(data.education, locale)}
      ${renderProjects(data.projects, locale)}
    </div>
    <aside class="col col--side">
      ${renderSkills(data.skills, locale)}
      ${renderLanguages(data.languages, locale)}
      ${renderCertifications(data.certifications, locale)}
      ${renderHobbies(data.hobbies, locale)}
    </aside>
  </main>`;
}

export function renderHead(data, locale) {
  const { meta, profile } = data;
  const title = `${meta.name} — ${t(meta.title, locale)}`;
  const description = t(profile, locale).slice(0, 155);
  const base = meta.siteUrl.replace(/\/$/, '');
  const nlUrl = base;
  const enUrl = `${base}/en/`;
  const canonical = locale === 'nl' ? nlUrl : enUrl;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: meta.name,
    jobTitle: t(meta.title, locale),
    email: `mailto:${meta.email}`,
    url: base,
    sameAs: [meta.github, meta.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: t(meta.location, locale) }
  };
  return `<title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <link rel="alternate" hreflang="nl" href="${escapeHtml(nlUrl)}" />
  <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}" />
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(nlUrl)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(base)}/photo.jpg" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}
```

- [ ] **Step 4: Draai de tests, verifieer dat ze slagen**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add header, body assembler and SEO head renderer"
```

---

## Task 5: Vite-plugin die de HTML injecteert

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Schrijf de custom render-plugin in `vite.config.js`**

```js
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { renderHead, renderBody } from './src/render.js';

function cvRenderPlugin() {
  return {
    name: 'cv-render',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // ctx.path is bijv. '/index.html' (NL) of '/en/index.html' (EN)
        const locale = ctx.path.includes('/en/') ? 'en' : 'nl';
        const data = JSON.parse(readFileSync(new URL('./cv-data.json', import.meta.url)));
        return html
          .replace('<!--CV_HEAD-->', renderHead(data, locale))
          .replace('<!--CV_BODY-->', renderBody(data, locale));
      },
    },
  };
}

export default defineConfig({
  plugins: [cvRenderPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        en: 'en/index.html',
      },
    },
  },
});
```

- [ ] **Step 2: Verifieer dat de content in de gebouwde HTML zit (zonder JS)**

Run: `npm run build`
Then run: `grep -c "masthead__name" dist/index.html dist/en/index.html`
Expected: beide bestanden geven `1` of meer — de gerenderde HTML staat statisch in de output.

- [ ] **Step 3: Verifieer dat de EN-pagina Engelse labels heeft**

Run: `grep -o "Experience\|Werkervaring" dist/en/index.html | head -1`
Expected: `Experience` (EN-pagina gebruikt Engelse labels).

- [ ] **Step 4: Verifieer de NL-pagina**

Run: `grep -o "Experience\|Werkervaring" dist/index.html | head -1`
Expected: `Werkervaring`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: inject rendered CV HTML at build via Vite plugin"
```

---

## Task 6: Styling — layout, kleur, typografie (A4)

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Schrijf de volledige scherm-styling in `src/style.css`**

```css
:root {
  --accent: #0f766e;
  --accent-dark: #0b5c55;
  --ink: #1f2937;
  --muted: #6b7280;
  --line: #e5e7eb;
  --sheet-w: 210mm;
  --sheet-pad: 16mm;
  --font: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: #e9ebef;
  color: var(--ink);
  font-family: var(--font);
  font-size: 10.5pt;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Papiervel */
body > header,
body > main {
  width: var(--sheet-w);
  margin-left: auto;
  margin-right: auto;
  background: #fff;
}
body > header { margin-top: 12mm; box-shadow: 0 2px 16px rgba(0,0,0,.12); }
body > main   { margin-bottom: 12mm; box-shadow: 0 2px 16px rgba(0,0,0,.12); min-height: 40mm; }

/* Kleurband-header */
.masthead { background: var(--accent); color: #fff; }
.masthead__inner {
  display: flex; align-items: center; gap: 20px;
  padding: 14mm var(--sheet-pad); position: relative;
}
.masthead__photo img {
  width: 120px; height: 120px; border-radius: 50%;
  object-fit: cover; border: 3px solid rgba(255,255,255,.85); display: block;
}
.masthead__name { margin: 0; font-size: 24pt; font-weight: 700; letter-spacing: -.5px; }
.masthead__title { margin: 2px 0 10px; font-size: 12pt; opacity: .92; }
.masthead__contact { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 9.5pt; }
.masthead__contact a { color: #fff; text-decoration: none; }
.masthead__contact a:hover, .masthead__contact a:focus { text-decoration: underline; }
.masthead__lang {
  position: absolute; top: 10px; right: var(--sheet-pad);
  color: #fff; border: 1px solid rgba(255,255,255,.6); border-radius: 4px;
  padding: 4px 10px; font-size: 9pt; text-decoration: none;
}
.masthead__lang:hover, .masthead__lang:focus { background: rgba(255,255,255,.15); }

/* Twee kolommen */
.sheet__main { display: grid; grid-template-columns: 1.9fr 1fr; gap: 0; }
.col { padding: 10mm var(--sheet-pad); }
.col--main { padding-right: 8mm; }
.col--side { background: #f8fafb; border-left: 1px solid var(--line); }

/* Secties */
.section { margin: 0 0 7mm; }
.section__title {
  font-size: 11pt; text-transform: uppercase; letter-spacing: 1px;
  color: var(--accent); font-weight: 700; margin: 0 0 8px;
  border-bottom: 2px solid var(--accent); padding-bottom: 4px;
}
.profile { margin: 0; }

.entry { margin-bottom: 6mm; }
.entry__head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.entry__role { margin: 0; font-size: 11.5pt; font-weight: 600; }
.entry__role a { color: var(--accent-dark); text-decoration: none; }
.entry__role a:hover, .entry__role a:focus { text-decoration: underline; }
.entry__period { color: var(--muted); font-size: 9pt; white-space: nowrap; }
.entry__meta { color: var(--muted); font-size: 9.5pt; margin: 2px 0 4px; }
.entry__desc { margin: 2px 0 0; }
.entry__bullets { margin: 4px 0 0; padding-left: 18px; }
.entry__bullets li { margin: 2px 0; }

.skills__group { margin-bottom: 5mm; }
.skills__name { margin: 0 0 4px; font-size: 10pt; font-weight: 600; }
.skills__list, .lang-list, .hobby-list, .cert-list { list-style: none; margin: 0; padding: 0; }
.skills__list { display: flex; flex-wrap: wrap; gap: 6px; }
.skills__list li {
  background: #fff; border: 1px solid var(--line); border-radius: 4px;
  padding: 2px 8px; font-size: 9pt;
}
.lang, .cert { display: flex; flex-direction: column; margin-bottom: 8px; }
.lang__name, .cert__name { font-weight: 600; font-size: 10pt; }
.lang__level, .cert__meta { color: var(--muted); font-size: 9pt; }
.hobby-list li { margin: 2px 0; }

/* Focus-zichtbaarheid (toegankelijkheid) */
a:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 2px; }
```

- [ ] **Step 2: Verifieer visueel in de browser met Playwright**

Run: `npm run dev` (in de achtergrond) en navigeer naar de dev-URL (standaard `http://localhost:5173/`).
Maak met Playwright een screenshot van de NL-pagina en van `/en/`.
Expected: teal kleurband bovenaan met naam/foto/contact, daaronder twee kolommen (brede hoofdkolom + lichte zijbalk), secties met teal-onderstreepte titels. Geen overlappende of afgeknipte elementen.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: A4 masthead + two-column layout in teal"
```

---

## Task 7: Print-styling (`Ctrl+P` → nette A4/PDF)

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: Voeg print-media queries toe onderaan `src/style.css`**

```css
@page {
  size: A4;
  margin: 0;
}

@media print {
  body { background: #fff; font-size: 10pt; }

  /* Vel vult de pagina, geen schaduw/marge/achtergrond van het scherm */
  body > header,
  body > main {
    width: auto; margin: 0; box-shadow: none;
  }

  /* Kleuren (teal band, accenten) meenemen in de print */
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  /* Schermelementen verbergen */
  .masthead__lang { display: none; }

  /* Marges via padding zodat de kleurband tot de rand loopt */
  .masthead__inner { padding: 12mm var(--sheet-pad); }
  .col { padding-top: 8mm; padding-bottom: 8mm; }

  /* Items niet over paginagrens breken */
  .entry, .skills__group, .lang, .cert, .section__title { break-inside: avoid; }
  .section { break-inside: auto; }
  .section__title { break-after: avoid; }

  /* Links niet blauw/onderstreept in print, wel leesbaar */
  a { color: inherit; text-decoration: none; }
}
```

- [ ] **Step 2: Verifieer de print-weergave met Playwright**

Genereer met Playwright een PDF van de dev-pagina (emuleer print media) en bekijk het resultaat.
Expected: teal band aanwezig, taalknop weg, inhoud netjes binnen A4-marges, geen items die lelijk over de paginagrens breken.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: print media queries for clean A4 output"
```

---

## Task 8: Beeldverwerking (sharp-script)

**Files:**
- Create: `scripts/process-photo.js`
- Create: `public/photo-src.jpg` (tijdelijke placeholder-afbeelding voor de test)

- [ ] **Step 1: Schrijf `scripts/process-photo.js`**

```js
// Verkleint/comprimeert de bronfoto naar WebP + JPEG-fallback.
// Draait mee in `npm run build`. Slaat over als de bron ontbreekt.
import sharp from 'sharp';
import { existsSync } from 'node:fs';

const SRC = 'public/photo-src.jpg';
const SIZE = 320; // ~2x weergavegrootte (140px) voor retina

if (!existsSync(SRC)) {
  console.warn(`[photos] ${SRC} niet gevonden — sla beeldverwerking over.`);
  process.exit(0);
}

const base = sharp(SRC).resize(SIZE, SIZE, { fit: 'cover', position: 'attention' });

await base.clone().webp({ quality: 82 }).toFile('public/photo.webp');
await base.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile('public/photo.jpg');

console.log('[photos] photo.webp en photo.jpg gegenereerd.');
```

- [ ] **Step 2: Zet een placeholder-bronfoto neer om het script te testen**

Genereer met sharp een effen testafbeelding zodat het script iets te verwerken heeft:
Run:
```bash
node -e "import('sharp').then(({default:s})=>s({create:{width:600,height:600,channels:3,background:{r:15,g:118,b:110}}}).jpeg().toFile('public/photo-src.jpg'))"
```
Expected: `public/photo-src.jpg` bestaat.

- [ ] **Step 3: Draai het script en verifieer de output**

Run: `npm run photos`
Then run: `ls -la public/photo.webp public/photo.jpg`
Expected: beide bestanden bestaan; `photo.webp` is kleiner dan de 600px-bron.

- [ ] **Step 4: Verifieer dat de foto in de gebouwde pagina laadt**

Run: `npm run build`
Then run: `grep -o "photo.webp\|photo.jpg" dist/index.html | sort -u`
Expected: beide `photo.webp` en `photo.jpg` komen voor (via `<picture>`).

- [ ] **Step 5: Negeer de gegenereerde bestanden in git**

Voeg toe aan `.gitignore`:
```
public/photo.webp
public/photo.jpg
```
(De bron `public/photo-src.jpg` wordt wél gecommit; de afgeleiden zijn build-output.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build-time photo optimization with sharp (webp + jpg)"
```

---

## Task 9: Toegankelijkheids- en SEO-verificatie

**Files:**
- Modify: `src/render.js` en/of `src/style.css` (alleen indien nodig n.a.v. bevindingen)

- [ ] **Step 1: Bouw en serveer de productie-build**

Run: `npm run build && npm run preview`
Noteer de preview-URL (standaard `http://localhost:4173/`).

- [ ] **Step 2: Controleer de documentstructuur met Playwright**

Navigeer naar de NL- en EN-pagina en controleer via de accessibility-snapshot:
- Precies één `<h1>` per pagina (de naam).
- Kopniveaus lopen logisch (h1 → h2 secties → h3 items).
- De foto heeft een niet-lege `alt`.
- De taalknop heeft een `aria-label`.
Expected: alle punten kloppen. Zo niet: pas de betreffende renderer aan en herbouw.

- [ ] **Step 3: Controleer kleurcontrast**

Verifieer dat witte tekst op teal (`#0f766e`) en teal tekst op wit voldoen aan WCAG AA (contrast ≥ 4.5:1 voor gewone tekst). `#0f766e` op wit ≈ 4.9:1 (voldoet); wit op `#0f766e` ≈ 4.9:1 (voldoet).
Expected: geen wijziging nodig. Als een tekst zakt onder 4.5:1, gebruik `--accent-dark` (`#0b5c55`).

- [ ] **Step 4: Draai een Lighthouse-audit (indien beschikbaar)**

Run: `npx lighthouse http://localhost:4173/ --only-categories=seo,accessibility --quiet --chrome-flags="--headless" --output=json --output-path=./lh.json` (indien `lighthouse` beschikbaar is; anders sla over en vertrouw op stap 2–3).
Then run: `node -e "const r=require('./lh.json');console.log('SEO',r.categories.seo.score,'A11y',r.categories.accessibility.score)"`
Expected: beide scores `1` (100). Los eventuele gerapporteerde issues op en herhaal.

- [ ] **Step 5: Ruim tijdelijke auditbestanden op en commit eventuele fixes**

Run:
```bash
rm -f lh.json
git add -A
git commit -m "test: verify accessibility and SEO; apply fixes" --allow-empty
```

---

## Task 10: Echte gegevens en foto

**Files:**
- Modify: `cv-data.json`
- Replace: `public/photo-src.jpg`

> Deze taak vereist input van de gebruiker: de echte CV-inhoud (in NL én EN) en een profielfoto.

- [ ] **Step 1: Verzamel de echte gegevens bij de gebruiker**

Vraag om, of ontvang: naam, functietitel, e-mail, GitHub-URL, LinkedIn-URL, locatie, definitieve `siteUrl`, profieltekst, werkervaringen (rol/bedrijf/periode/locatie/bullets), opleiding(en), skill-groepen, projecten (naam/url/beschrijving), certificeringen, talen + niveau, en hobby's — telkens in NL en EN.

- [ ] **Step 2: Vul `cv-data.json` met de echte gegevens**

Vervang de voorbeelddata één-op-één; behoud exact dezelfde structuur en `{nl,en}`-vorm. Zorg dat elk vertaalbaar veld beide talen heeft.

- [ ] **Step 3: Plaats de echte profielfoto**

Vervang `public/photo-src.jpg` door de aangeleverde foto (bij voorkeur vierkant of groter dan 320×320; het script verkleint/crop't automatisch).

- [ ] **Step 4: Herbouw en verifieer end-to-end**

Run: `npm run build`
Then: open `dist/index.html` en `dist/en/index.html` in de browser (via `npm run preview`) en controleer inhoud, foto, taalwissel en print-preview (`Ctrl+P`).
Expected: echte gegevens zichtbaar in beide talen, foto scherp, print oogt als nette A4.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "content: add real CV data and profile photo"
```

---

## Zelf-review (uitgevoerd door de planschrijver)

- **Spec-dekking:** layout C/teal/sans (Task 6), A4 + print (Task 6/7), één JSON-bron + makkelijk uitbreiden (Task 2/3), tweetalig NL/EN met taalwissel (Task 4/5), foto-optimalisatie (Task 8), SEO incl. JSON-LD/hreflang/OG (Task 4), toegankelijkheid + Lighthouse (Task 9), echte data + foto (Task 10). Alle spec-onderdelen gedekt.
- **Placeholders:** geen open TODO's; alle codestappen bevatten volledige code.
- **Type-consistentie:** functienamen en datavelden (`meta`, `experience[].bullets`, `skills[].items`, `renderBody/renderHead`, `LABELS`) komen overeen tussen taken.
```
