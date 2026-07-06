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

export function safeUrl(url) {
  return /^(https?:|mailto:)/i.test(String(url)) ? url : '#';
}

export function t(value, locale) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (locale in value) return value[locale];
    // Graceful fallback: a translation object missing the requested locale
    // degrades to the other language instead of rendering "[object Object]".
    const other = locale === 'nl' ? 'en' : 'nl';
    if (other in value) return value[other];
  }
  return value;
}

function sectionTitle(key, locale) {
  return `<h2 class="section__title">${escapeHtml(t(LABELS[key], locale))}</h2>`;
}

export function renderProfile(profile, locale) {
  const text = t(profile, locale);
  if (!text) return '';
  return `<section class="section" id="profiel">
    ${sectionTitle('profile', locale)}
    <p class="profile">${escapeHtml(text)}</p>
  </section>`;
}

export function renderExperience(experience, locale) {
  if (!experience.length) return '';
  const items = experience.map((job) => {
    const loc = job.location
      ? `<span class="entry__loc">${escapeHtml(t(job.location, locale))}</span>`
      : '';
    const roles = job.roles.map((r) => {
      const bullets = r.bullets && r.bullets.length
        ? `<ul class="entry__bullets">${r.bullets.map((b) => `<li>${escapeHtml(t(b, locale))}</li>`).join('')}</ul>`
        : '';
      return `<div class="role">
        <div class="entry__head">
          <h4 class="role__title">${escapeHtml(r.role)}</h4>
          <span class="entry__period">${escapeHtml(t(r.period, locale))}</span>
        </div>
        ${bullets}
      </div>`;
    }).join('');
    const grouped = job.roles.length > 1 ? ' entry--grouped' : '';
    return `<article class="entry${grouped}">
      <div class="entry__company">
        <h3 class="entry__org">${escapeHtml(job.company)}</h3>
        ${loc}
      </div>
      ${roles}
    </article>`;
  }).join('');
  return `<section class="section" id="werkervaring">
    ${sectionTitle('experience', locale)}${items}
  </section>`;
}

export function renderEducation(education, locale) {
  if (!education.length) return '';
  const items = education.map((ed) => `<article class="entry">
      <div class="entry__head">
        <h3 class="entry__role">${escapeHtml(t(ed.degree, locale))}</h3>
        <span class="entry__period">${escapeHtml(t(ed.period, locale))}</span>
      </div>
      <div class="entry__meta">${escapeHtml(ed.institution)}</div>
    </article>`).join('');
  return `<section class="section" id="opleiding">
    ${sectionTitle('education', locale)}${items}
  </section>`;
}

export function renderSkills(skills, locale) {
  if (!skills.length) return '';
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
  if (!projects.length) return '';
  const items = projects.map((p) => `<article class="entry">
      <h3 class="entry__role">
        <a href="${escapeHtml(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>
      </h3>
      <p class="entry__desc">${escapeHtml(t(p.description, locale))}</p>
    </article>`).join('');
  return `<section class="section" id="projecten">
    ${sectionTitle('projects', locale)}${items}
  </section>`;
}

export function renderCertifications(certifications, locale) {
  if (!certifications.length) return '';
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
  if (!languages.length) return '';
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
  if (!hobbies.length) return '';
  const items = hobbies.map((h) => `<li>${escapeHtml(t(h, locale))}</li>`).join('');
  return `<section class="section" id="hobbys">
    ${sectionTitle('hobbies', locale)}
    <ul class="hobby-list">${items}</ul>
  </section>`;
}

// Kleine inline SVG-iconen (erven kleur via currentColor); printen mee.
const ICONS = {
  email: '<svg class="ico" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="currentColor"><path d="M2 3h12a1 1 0 0 1 1 1v.4l-7 4.2-7-4.2V4a1 1 0 0 1 1-1zm-1 3.27V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.27l-6.49 3.9a1 1 0 0 1-1.02 0L1 6.27z"/></svg>',
  github: '<svg class="ico" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
  linkedin: '<svg class="ico" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="currentColor"><path d="M13.63 13.63h-2.37V9.9c0-.89-.02-2.03-1.24-2.03-1.24 0-1.43.97-1.43 1.97v3.79H6.22V6h2.28v1.04h.03c.32-.6 1.09-1.24 2.25-1.24 2.4 0 2.85 1.58 2.85 3.64v4.19zM3.56 4.96a1.38 1.38 0 1 1 0-2.76 1.38 1.38 0 0 1 0 2.76zM4.75 13.63H2.37V6h2.38v7.63zM14.82 0H1.18C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0z"/></svg>'
};

// Volledig uitgeschreven link zonder protocol/www (leesbaar/typebaar op een geprinte CV).
// bv. "https://github.com/JustInToCoding" -> "github.com/JustInToCoding".
export function linkLabel(url) {
  return String(url).replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
}

// Base-pad van de site (bv. "/cv/") afgeleid uit siteUrl, zodat asset- en
// navigatielinks kloppen wanneer de CV onder een subpad wordt gehost (Vercel /cv/).
export function basePath(siteUrl) {
  try {
    const p = new URL(siteUrl).pathname;
    return p.endsWith('/') ? p : p + '/';
  } catch {
    return '/';
  }
}

export function renderHeader(meta, locale) {
  const base = basePath(meta.siteUrl);
  const switchHref = locale === 'nl' ? `${base}en/` : base;
  return `<header class="masthead">
    <div class="masthead__inner">
      <picture class="masthead__photo">
        <source srcset="${base}photo.webp" type="image/webp" />
        <img src="${base}photo.jpg" width="140" height="140"
             alt="${escapeHtml(t(meta.photoAlt, locale))}" loading="eager" decoding="async" />
      </picture>
      <div class="masthead__intro">
        <h1 class="masthead__name">${escapeHtml(meta.name)}</h1>
        <p class="masthead__title">${escapeHtml(t(meta.title, locale))}</p>
        <ul class="masthead__contact">
          <li><a href="${escapeHtml(safeUrl('mailto:' + meta.email))}">${ICONS.email}<span>${escapeHtml(meta.email)}</span></a></li>
          <li><a href="${escapeHtml(safeUrl(meta.github))}" target="_blank" rel="noopener noreferrer">${ICONS.github}<span>${escapeHtml(linkLabel(meta.github))}</span></a></li>
          <li><a href="${escapeHtml(safeUrl(meta.linkedin))}" target="_blank" rel="noopener noreferrer">${ICONS.linkedin}<span>${escapeHtml(linkLabel(meta.linkedin))}</span></a></li>
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

function truncate(str, max) {
  const chars = Array.from(str);
  if (chars.length <= max) return str;
  const cut = chars.slice(0, max).join('');
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

export function renderHead(data, locale) {
  const { meta, profile } = data;
  const title = `${meta.name} — ${t(meta.title, locale)}`;
  // Eigen, afgeronde beschrijving; valt terug op het profiel. Ruime limiet als vangnet.
  const description = truncate(t(meta.description || profile, locale), 160);
  const base = meta.siteUrl.replace(/\/$/, '');
  const path = basePath(meta.siteUrl);
  const nlUrl = base;
  const enUrl = `${base}/en/`;
  const canonical = locale === 'nl' ? nlUrl : enUrl;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: meta.name,
    jobTitle: t(meta.title, locale),
    email: `mailto:${meta.email}`,
    url: canonical,
    sameAs: [meta.github, meta.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: t(meta.location, locale) }
  };
  return `<title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="icon" type="image/svg+xml" href="${path}favicon.svg" />
  <meta name="theme-color" content="#0f766e" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <link rel="alternate" hreflang="nl" href="${escapeHtml(nlUrl)}" />
  <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}" />
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(nlUrl)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:image" content="${escapeHtml(base)}/photo.jpg" />
  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c')}</script>`;
}
