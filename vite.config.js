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
