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
