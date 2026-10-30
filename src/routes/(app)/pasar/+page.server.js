import { guard } from '$lib/server/guard.js';
import { rpc, num, names } from '$lib/server/helpers.js';

export const load = async ({ locals, url }) => {
  const { sb } = await guard(locals, 'supplier');
  const p = url.searchParams, clean = (s) => (s ?? '').replace(/[%_,()]/g, ' ').trim();
  let q = sb.from('harvest_offers').select('*').eq('status', 'active').gt('remaining_kg', 0);
  if (clean(p.get('q'))) q = q.ilike('commodity', `%${clean(p.get('q'))}%`);
  if (clean(p.get('loc'))) q = q.ilike('location', `%${clean(p.get('loc'))}%`);
  if (p.get('cat')) q = q.eq('category_id', Number(p.get('cat')));
  if (['A', 'B', 'C'].includes(p.get('grade'))) q = q.eq('grade', p.get('grade'));
  if (num(p.get('max')) > 0) q = q.lte('price_per_kg', num(p.get('max')));
  q = q.order(p.get('sort') === 'desc' ? 'price_per_kg' : p.get('sort') === 'asc' ? 'price_per_kg' : 'created_at', { ascending: p.get('sort') === 'asc' }).limit(60);
  const [{ data }, c] = await Promise.all([q, sb.from('categories').select('id,name').order('id')]);
  const offers = data ?? [];
  return { offers, cats: c.data ?? [], who: await names(sb, offers.map((o) => o.farmer_id)), f: Object.fromEntries(p) };
};
export const actions = { order: rpc('supplier', 'place_purchase_order', (f) => ({ p_offer: f.id, p_qty: num(f.qty) }), 'Pesanan dikirim ke petani') };
