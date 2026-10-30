import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';
import { num } from '$lib/server/helpers.js';

export const load = async ({ locals, url }) => {
  const { sb } = await guard(locals, 'store');
  const p = url.searchParams, clean = (s) => (s ?? '').replace(/[%_,()]/g, ' ').trim();
  let q = sb.from('market_listings').select('*');
  if (clean(p.get('q'))) q = q.ilike('commodity', `%${clean(p.get('q'))}%`);
  if (clean(p.get('loc'))) q = q.ilike('location', `%${clean(p.get('loc'))}%`);
  if (p.get('cat')) q = q.eq('category_id', Number(p.get('cat')));
  if (['A', 'B', 'C'].includes(p.get('grade'))) q = q.eq('grade', p.get('grade'));
  if (num(p.get('max')) > 0) q = q.lte('price_per_kg', num(p.get('max')));
  q = q.order('price_per_kg', { ascending: p.get('sort') !== 'desc' }).limit(60);
  const [{ data }, c] = await Promise.all([q, sb.from('categories').select('id,name').order('id')]);
  return { items: data ?? [], cats: c.data ?? [], f: Object.fromEntries(p) };
};
export const actions = {
  add: async ({ request, locals }) => {
    const { user, sb } = await guard(locals, 'store');
    const f = await request.formData(), qty = num(f.get('qty'));
    if (!(qty > 0)) return fail(400, { error: 'Jumlah harus lebih dari 0.' });
    const { data: l } = await sb.from('market_listings').select('available_kg,commodity').eq('id', f.get('id')).maybeSingle();
    if (!l) return fail(400, { error: 'Produk tidak tersedia.' });
    const { data: cur } = await sb.from('cart_items').select('qty_kg').eq('store_id', user.id).eq('listing_id', f.get('id')).maybeSingle();
    const total = qty + Number(cur?.qty_kg ?? 0);
    if (total > Number(l.available_kg)) return fail(400, { error: `Stok ${l.commodity} hanya ${l.available_kg} kg.` });
    const { error } = await sb.from('cart_items').upsert({ store_id: user.id, listing_id: f.get('id'), qty_kg: total }, { onConflict: 'store_id,listing_id' });
    return error ? fail(400, { error: error.message }) : { ok: `${l.commodity} ditambahkan ke keranjang` };
  }
};
