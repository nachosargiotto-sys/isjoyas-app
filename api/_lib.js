// Utilidades compartidas de las funciones del servidor (Vercel).
import crypto from 'node:crypto';

const DAY = 86400;
const PEOPLE = ['Nacho', 'Vale'];

function sign(payload) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update(payload).digest('base64url');
}

export function makeSession(person) {
  const exp = Math.floor(Date.now() / 1000) + 180 * DAY;
  const payload = `${person}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function readSession(req) {
  const raw = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith('isj='));
  if (!raw) return null;
  const [person, exp, mac] = decodeURIComponent(raw.slice(4)).split('.');
  if (!PEOPLE.includes(person) || !mac) return null;
  const good = sign(`${person}.${exp}`);
  if (good.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(mac))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return person;
}

export function setSessionCookie(res, value, maxAge = 180 * DAY) {
  res.setHeader('Set-Cookie', `isj=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
}

/** Corta el pedido si no hay sesión válida. Devuelve la persona. */
export function requireUser(req, res) {
  const who = readSession(req);
  if (!who) { res.status(401).json({ error: 'Iniciá sesión' }); return null; }
  return who;
}

/** Llama a la API de la planilla (Apps Script). */
export async function callScript(action, extra = {}) {
  const url = process.env.SCRIPT_URL;
  if (!url) throw new Error('Falta configurar SCRIPT_URL');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ secret: process.env.SCRIPT_SECRET, action, ...extra }),
    redirect: 'follow',
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`La planilla respondió algo inesperado (${r.status})`); }
  if (!json.ok) throw new Error(json.error || 'Error de la planilla');
  return json.data;
}

export function fail(res, err, status = 500) {
  res.status(status).json({ error: String(err && err.message || err) });
}
