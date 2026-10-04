import { fail, requireUser } from './_lib.js';

// GET ?since=AAAA-MM-DD → ventas pagadas de la tienda web (Tienda Nube) desde esa fecha, simplificadas.
export default async function handler(req, res) {
  if (!requireUser(req, res)) return;
  const token = process.env.TIENDANUBE_TOKEN;
  const store = process.env.TIENDANUBE_STORE_ID;
  if (!token || !store) return fail(res, 'Falta configurar Tienda Nube en el servidor', 500);
  const since = /^\d{4}-\d{2}-\d{2}$/.test(req.query.since || '') ? req.query.since : new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  try {
    const out = [];
    for (let page = 1; page <= 10; page++) {
      const url = `https://api.tiendanube.com/2025-03/${store}/orders?created_at_min=${since}T00:00:00-03:00&per_page=100&page=${page}`;
      const r = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Authentication: `bearer ${token}`,
          'User-Agent': 'IS Joyas App (nachosargiotto@gmail.com)',
          'Content-Type': 'application/json',
        },
      });
      if (r.status === 404 && page > 1) break;
      if (!r.ok) throw new Error(`Tienda Nube respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
      const list = await r.json();
      if (!Array.isArray(list) || !list.length) break;
      for (const o of list) {
        out.push({
          id: String(o.id),
          number: o.number,
          date: String(o.paid_at || o.created_at || '').slice(0, 10),
          createdAt: o.created_at,
          status: o.status,
          paymentStatus: o.payment_status,
          shippingStatus: o.shipping_status,
          client: o.contact_name || (o.customer && o.customer.name) || '',
          email: o.contact_email || (o.customer && o.customer.email) || '',
          phone: o.contact_phone || (o.customer && o.customer.phone) || '',
          total: Number(o.total) || 0,
          subtotal: Number(o.subtotal) || 0,
          discount: Number(o.discount) || 0,
          shippingCustomer: Number(o.shipping_cost_customer) || 0,
          gateway: o.gateway_name || o.gateway || '',
          installments: o.payment_details && o.payment_details.installments,
          products: (o.products || []).map((p) => ({
            productId: String(p.product_id), variantId: String(p.variant_id), name: p.name, price: Number(p.price) || 0,
            qty: Number(p.quantity) || 1, sku: p.sku || '', variant: (p.variant_values || []).join(' / '), image: p.image && p.image.src,
          })),
        });
      }
      if (list.length < 100) break;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({ orders: out });
  } catch (e) { fail(res, e); }
}
