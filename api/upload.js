import { callScript, fail, requireUser } from './_lib.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

// POST { dataUrl, name } → { url } (imagen guardada en Drive)
export default async function handler(req, res) {
  if (!requireUser(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { dataUrl, name } = req.body || {};
    const m = /^data:(image\/[\w+.-]+);base64,(.+)$/.exec(dataUrl || '');
    if (!m) return fail(res, 'Imagen inválida', 400);
    res.json(await callScript('upload', { mime: m[1], data: m[2], name }));
  } catch (e) { fail(res, e); }
}
