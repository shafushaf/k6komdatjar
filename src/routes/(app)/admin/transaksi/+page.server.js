import { guard } from '$lib/server/guard.js';
import { rpc, names } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { sb } = await guard(locals, 'admin');
  const [pay, so, po, b, sh] = await Promise.all([
    sb.from('payments').select('*').order('created_at', { ascending: false }).limit(50),
    sb.from('store_orders').select('*').order('created_at', { ascending: false }).limit(50),
    sb.from('purchase_orders').select('*').order('created_at', { ascending: false }).limit(50),
    sb.from('inventory_batches').select('*').order('received_at', { ascending: false }).limit(50),
    sb.from('shipments').select('order_id,status,courier,tracking_no').order('updated_at', { ascending: false }).limit(50)]);
  const payments = pay.data ?? [], orders = so.data ?? [], pos = po.data ?? [], batches = b.data ?? [];
  const who = await names(sb, [...payments.flatMap((p) => [p.payer_id, p.payee_id]), ...orders.flatMap((o) => [o.store_id, o.supplier_id]), ...pos.flatMap((p) => [p.supplier_id, p.farmer_id]), ...batches.map((x) => x.supplier_id)]);
  const proofs = {};
  for (const p of payments.filter((x) => x.proof_path && x.status === 'awaiting_verification')) {
    const { data } = await sb.storage.from('proofs').createSignedUrl(p.proof_path, 600);
    proofs[p.id] = data?.signedUrl;
  }
  const codes = Object.fromEntries([...orders, ...pos].map((x) => [x.id, x.code]));
  return { payments, orders, pos, batches, who, proofs, codes, ship: Object.fromEntries((sh.data ?? []).map((s) => [s.order_id, s])) };
};
export const actions = {
  ok: rpc('admin', 'verify_payment', (f) => ({ p_id: f.id, p_ok: true }), 'Pembayaran diverifikasi'),
  no: rpc('admin', 'verify_payment', (f) => ({ p_id: f.id, p_ok: false }), 'Pembayaran ditolak')
};
