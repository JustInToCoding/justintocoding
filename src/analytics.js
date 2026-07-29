import { inject } from '@vercel/analytics';

// Vercel Web Analytics. De modus wordt expliciet gezet: de 'auto'-detectie van het
// pakket leest process.env.NODE_ENV, dat in de browserbundel van Vite niet bestaat.
// Zonder dit valt het altijd terug op 'production' en probeert de dev-server het
// script /_vercel/insights/script.js te laden, dat alleen op Vercel bestaat (404).
inject({ mode: import.meta.env.DEV ? 'development' : 'production' });
