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
