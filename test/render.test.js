import { describe, it, expect } from 'vitest';
import { escapeHtml, t } from '../src/render.js';
import {
  renderProfile, renderExperience, renderSkills,
  renderProjects, renderLanguages, renderHobbies,
  safeUrl, renderEducation, renderCertifications,
  renderHeader, renderBody, renderHead
} from '../src/render.js';

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
  it('valt terug op de andere taal als de gevraagde ontbreekt', () => {
    expect(t({ nl: 'Alleen NL' }, 'en')).toBe('Alleen NL');
  });
});

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
  it('kiest de Engelse teksten bij en-locale', () => {
    expect(renderExperience(exp, 'en')).toContain('Did &lt;X&gt;');
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

describe('safeUrl', () => {
  it('laat http(s) en mailto door', () => {
    expect(safeUrl('https://x.dev')).toBe('https://x.dev');
    expect(safeUrl('mailto:a@b.nl')).toBe('mailto:a@b.nl');
  });
  it('blokkeert javascript: en andere schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('#');
  });
});

describe('renderEducation', () => {
  it('rendert diploma, instituut en periode', () => {
    const html = renderEducation([{ degree: { nl: 'HBO', en: 'BSc' }, institution: 'HU', period: '2019 – 2023' }], 'en');
    expect(html).toContain('BSc');
    expect(html).toContain('HU');
    expect(html).toContain('2019 – 2023');
  });
});

describe('renderCertifications', () => {
  it('rendert naam, uitgever en jaar', () => {
    const html = renderCertifications([{ name: 'AWS', issuer: 'Amazon', year: '2024' }], 'nl');
    expect(html).toContain('AWS');
    expect(html).toContain('Amazon');
    expect(html).toContain('2024');
  });
});

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
  it('kapt de meta-description af op een woordgrens met ellipsis', () => {
    const longData = { ...data, profile: { nl: 'woord '.repeat(60), en: 'word '.repeat(60) } };
    const html = renderHead(longData, 'nl');
    const m = html.match(/name="description" content="([^"]*)"/);
    expect(m[1].length).toBeLessThanOrEqual(156);
    expect(m[1].endsWith('…')).toBe(true);
    expect(m[1]).not.toMatch(/woor$/); // niet mid-woord afgekapt
  });
  it('voorkomt </script>-breakout in de JSON-LD', () => {
    const evil = { ...data, meta: { ...data.meta, name: 'Jane </script> Doe' } };
    const html = renderHead(evil, 'nl');
    expect(html).not.toContain('</script> Doe');
    expect(html).toContain('\\u003c/script>');
  });
});

describe('renderBody', () => {
  it('bevat header en main', () => {
    const html = renderBody(data, 'nl');
    expect(html).toContain('<header');
    expect(html).toContain('<main');
  });
});

describe('lege secties', () => {
  it('renderExperience geeft leegte terug bij een lege array', () => {
    expect(renderExperience([], 'nl')).toBe('');
  });
  it('renderCertifications geeft leegte terug bij een lege array', () => {
    expect(renderCertifications([], 'nl')).toBe('');
  });
  it('renderProjects geeft leegte terug bij een lege array', () => {
    expect(renderProjects([], 'en')).toBe('');
  });
  it('renderHobbies geeft leegte terug bij een lege array', () => {
    expect(renderHobbies([], 'nl')).toBe('');
  });
  it('renderSkills, renderLanguages, renderEducation idem', () => {
    expect(renderSkills([], 'nl')).toBe('');
    expect(renderLanguages([], 'nl')).toBe('');
    expect(renderEducation([], 'nl')).toBe('');
  });
  it('renderProfile geeft leegte terug bij lege tekst', () => {
    expect(renderProfile({ nl: '', en: '' }, 'nl')).toBe('');
  });
  it('niet-lege secties renderen nog steeds normaal', () => {
    expect(renderHobbies([{ nl: 'Zeilen', en: 'Sailing' }], 'nl')).toContain('Zeilen');
  });
});

describe('vertaalbare periode', () => {
  it('renderExperience vertaalt een {nl,en}-periode', () => {
    const exp = [{
      role: 'Dev', company: 'Acme', period: { nl: 'okt 2024 – heden', en: 'Oct 2024 – present' },
      location: { nl: 'Utrecht', en: 'Utrecht' }, bullets: []
    }];
    expect(renderExperience(exp, 'nl')).toContain('okt 2024 – heden');
    expect(renderExperience(exp, 'en')).toContain('Oct 2024 – present');
  });
  it('renderEducation vertaalt een {nl,en}-periode', () => {
    const ed = [{ degree: { nl: 'x', en: 'x' }, institution: 'HU', period: { nl: '2011 – nu', en: '2011 – now' } }];
    expect(renderEducation(ed, 'en')).toContain('2011 – now');
  });
});
