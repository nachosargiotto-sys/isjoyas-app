import { callScript, fail, requireUser } from './_lib.js';

// POST → crea en la planilla las pestañas y columnas que usa la app (se puede repetir sin problema).
export default async function handler(req, res) {
  if (!requireUser(req, res)) return;
  try { res.json(await callScript('setup')); } catch (e) { fail(res, e); }
}
