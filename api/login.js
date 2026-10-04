import { makeSession, readSession, setSessionCookie } from './_lib.js';

// POST { person: 'Nacho' | 'Vale', pin } → cookie de sesión. GET → quién está conectado. DELETE → salir.
export default async function handler(req, res) {
  if (req.method === 'GET') return res.json({ person: readSession(req) });
  if (req.method === 'DELETE') { setSessionCookie(res, '', 0); return res.json({ ok: true }); }
  if (req.method !== 'POST') return res.status(405).end();
  const { person, pin } = req.body || {};
  const expected = person === 'Nacho' ? process.env.NACHO_PIN : person === 'Vale' ? process.env.VALE_PIN : null;
  if (!expected || !process.env.SESSION_SECRET) return res.status(500).json({ error: 'Falta configurar los PIN en el servidor' });
  if (String(pin || '') !== String(expected)) {
    await new Promise((r) => setTimeout(r, 1200));
    return res.status(401).json({ error: 'PIN incorrecto' });
  }
  setSessionCookie(res, makeSession(person));
  res.json({ person });
}
