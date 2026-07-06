import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { renderHead, renderBody, basePath } from './src/render.js';

// Base-pad afgeleid uit siteUrl in cv-data.json (bv. "/cv/"), zodat Vite alle
// asset-URL's onder dat subpad plaatst — nodig voor hosting op justintocoding.com/cv.
const cvData = JSON.parse(readFileSync(new URL('./cv-data.json', import.meta.url)));
const base = basePath(cvData.meta.siteUrl);

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
  base,
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
