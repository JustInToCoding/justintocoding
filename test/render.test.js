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
