import { guard } from '$lib/server/guard.js';
import { rpc, num, names } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals, 'supplier');
  const { data } = await sb.from('store_orders').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false });
  const orders = data ?? [], ids = orders.map((o) => o.id);
  const [it, sh, pay, who] = await Promise.all([
    sb.from('store_order_items').select('*').in('order_id', ids), sb.from('shipments').select('*').in('order_id', ids),
    sb.from('payments').select('ref_id,status,amount').eq('kind', 'store').in('ref_id', ids), names(sb, orders.map((o) => o.store_id))]);
  const by = (rows, k) => rows.reduce((a, r) => ((a[r[k]] ??= []).push(r), a), {});
  return { orders, items: by(it.data ?? [], 'order_id'), ship: Object.fromEntries((sh.data ?? []).map((s) => [s.order_id, s])), pay: Object.fromEntries((pay.data ?? []).map((p) => [p.ref_id, p])), who };
};
export const actions = {
  accept: rpc('supplier', 'supplier_respond_order', (f) => ({ p_id: f.id, p_accept: true, p_ship_fee: num(f.fee) || 0 }), 'Pesanan dikonfirmasi, menunggu pembayaran toko'),
  reject: rpc('supplier', 'supplier_respond_order', (f) => ({ p_id: f.id, p_accept: false, p_ship_fee: 0 }), 'Pesanan ditolak, stok dilepas'),
  process: rpc('supplier', 'supplier_process_order', (f) => ({ p_id: f.id }), 'Pesanan diproses'),
  ship: rpc('supplier', 'supplier_ship_order', (f) => ({ p_id: f.id, p_courier: f.courier, p_tracking: f.tracking ?? '' }), 'Pesanan dikirim, stok berkurang')
};
