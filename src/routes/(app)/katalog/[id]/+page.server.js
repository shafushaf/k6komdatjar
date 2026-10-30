import { error } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';
export { actions } from '../+page.server.js';

export const load = async ({ locals, params }) => {
  const { sb } = await guard(locals, 'store');
  const { data: item } = await sb.from('market_listings').select('*').eq('id', params.id).maybeSingle();
  if (!item) throw error(404, 'Produk tidak ditemukan atau stok habis');
  const { data: reviews } = await sb.from('reviews').select('rating,comment,created_at').eq('supplier_id', item.supplier_id).order('created_at', { ascending: false }).limit(10);
  const r = reviews ?? [];
  return { item, reviews: r, avg: r.length ? r.reduce((a, x) => a + x.rating, 0) / r.length : null };
};
