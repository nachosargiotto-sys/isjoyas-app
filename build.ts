// Arma la app: JS con bun build y un HTML con todo embebido (sirve para Vercel y para la vista previa).
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
async function bundle(mode: 'demo' | 'sheets') {
  const r = await Bun.build({ entrypoints: [mode === 'demo' ? 'src/main.demo.tsx' : 'src/main.tsx'], minify: true, target: 'browser',
    define: { 'process.env.NODE_ENV': '"production"', __MODE__: JSON.stringify(mode) } });
  if (!r.success) { console.error(r.logs); process.exit(1); }
  return (await r.outputs[0].text()).replace(/<\/script/g, '<\\/script');
}
const js = await bundle('demo');
const jsProd = await bundle('sheets');
const css = readFileSync('src/styles.css', 'utf8');
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500..700;1,6..96,500&family=Instrument+Sans:wght@400..700&display=swap">';
const page = (code: string) => `<title>IS Joyas</title>\n${fonts}\n<style>${css}</style>\n<div id="root"></div>\n<script>${code}</script>\n`;
const body = page(js);
mkdirSync('dist', { recursive: true });
// Para la vista previa como Artifact (sin esqueleto propio)
writeFileSync('dist/artifact.html', body);
// Para hosting propio (Vercel): documento completo e instalable
// Para el hosting propio (Vercel): versión conectada, SIN datos embebidos (los trae del servidor con login).
mkdirSync('public', { recursive: true });
writeFileSync('public/index.html', `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0f1312"><meta name="robots" content="noindex"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"><link rel="apple-touch-icon" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="IS Joyas">${page(jsProd).replace('<div id="root">', '</head><body><div id="root">')}</body></html>`);
writeFileSync('public/manifest.webmanifest', JSON.stringify({ name: 'IS Joyas', short_name: 'IS Joyas', start_url: '/', display: 'standalone', background_color: '#0f1312', theme_color: '#0f1312', lang: 'es',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }] }));
writeFileSync('dist/manifest.webmanifest', JSON.stringify({ name: 'IS Joyas', short_name: 'IS Joyas', start_url: '.', display: 'standalone', background_color: '#0f1312', theme_color: '#0f1312', lang: 'es' }));
console.log('ok', (body.length / 1024).toFixed(0), 'KB');
