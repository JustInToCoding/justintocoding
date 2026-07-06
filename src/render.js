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
        <a href="${escapeHtml(safeUrl(p.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.name)}</a>
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
          <li><a href="${escapeHtml(safeUrl('mailto:' + meta.email))}">${escapeHtml(meta.email)}</a></li>
          <li><a href="${escapeHtml(safeUrl(meta.github))}" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          <li><a href="${escapeHtml(safeUrl(meta.linkedin))}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
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
  <script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;
}
