import { guard } from '$lib/server/guard.js';
import { rpc, num, names, pay } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals, 'store');
  const { data } = await sb.from('store_orders').select('*').eq('store_id', user.id).order('created_at', { ascending: false });
  const orders = data ?? [], ids = orders.map((o) => o.id);
  const [it, sh, p, rv, who] = await Promise.all([
    sb.from('store_order_items').select('*').in('order_id', ids), sb.from('shipments').select('*').in('order_id', ids),
    sb.from('payments').select('ref_id,status,amount').eq('kind', 'store').in('ref_id', ids).order('created_at', { ascending: false }),
    sb.from('reviews').select('order_id,rating').in('order_id', ids), names(sb, orders.map((o) => o.supplier_id))]);
  const items = {};
  for (const i of it.data ?? []) (items[i.order_id] ??= []).push(i);
  const pay = {};
  for (const x of p.data ?? []) pay[x.ref_id] ??= x;  // pembayaran terbaru
  return { orders, items, ship: Object.fromEntries((sh.data ?? []).map((s) => [s.order_id, s])), pay, rated: Object.fromEntries((rv.data ?? []).map((r) => [r.order_id, r.rating])), who };
};
export const actions = {
  pay: pay('store', 'store'),
  cancel: rpc('store', 'store_cancel_order', (f) => ({ p_id: f.id }), 'Pesanan dibatalkan'),
  receive: rpc('store', 'store_receive_order', (f) => ({ p_id: f.id }), 'Barang diterima, pesanan selesai'),
  review: rpc('store', 'submit_review', (f) => ({ p_id: f.id, p_rating: Number(f.rating), p_comment: f.comment ?? '' }), 'Terima kasih atas ulasan Anda')
};
