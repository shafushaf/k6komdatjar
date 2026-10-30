import { guard } from '$lib/server/guard.js';
import { rpc, num, names } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals, 'supplier');
  const [b, l, m] = await Promise.all([
    sb.from('inventory_batches').select('*').eq('supplier_id', user.id).order('received_at', { ascending: false }),
    sb.from('supplier_products').select('batch_id,price_per_kg,is_listed').eq('supplier_id', user.id),
    sb.from('stock_movements').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false }).limit(40)
  ]);
  const batches = b.data ?? [];
  return { batches, listings: Object.fromEntries((l.data ?? []).map((x) => [x.batch_id, x])), moves: m.data ?? [], who: await names(sb, batches.map((x) => x.farmer_id)) };
};
export const actions = { list: rpc('supplier', 'upsert_listing', (f) => ({ p_batch: f.id, p_price: num(f.price), p_listed: f.listed === 'on' }), 'Katalog diperbarui') };
