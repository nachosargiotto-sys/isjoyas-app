import { callScript, fail, requireUser } from './_lib.js';

const TABS = ['Sales', 'Expenses', 'Products', 'Chains', 'Personalizados', 'MetalApp', 'AjustesApp'];

// GET → todos los datos. POST { ops: [{op:'upsert'|'delete', tab, key, row|id}] } → guarda cambios.
export default async function handler(req, res) {
  const who = requireUser(req, res);
  if (!who) return;
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ person: who, tables: await callScript('load') });
    }
    if (req.method === 'POST') {
      const ops = (req.body && req.body.ops) || [];
      if (!Array.isArray(ops) || ops.some((o) => !TABS.includes(o.tab))) return fail(res, 'Pedido inválido', 400);
      return res.json({ results: await callScript('batch', { ops }) });
    }
    res.status(405).end();
  } catch (e) { fail(res, e); }
}
