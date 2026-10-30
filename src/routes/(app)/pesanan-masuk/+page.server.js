import { guard } from '$lib/server/guard.js';
import { rpc, names } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals, 'farmer');
  const { data } = await sb.from('purchase_orders').select('*').eq('farmer_id', user.id).order('created_at', { ascending: false });
  const pos = data ?? [];
  const [who, pay] = await Promise.all([names(sb, pos.map((p) => p.supplier_id)), sb.from('payments').select('ref_id,status,amount').eq('kind', 'purchase').in('ref_id', pos.map((p) => p.id))]);
  return { pos, who, pay: Object.fromEntries((pay.data ?? []).map((p) => [p.ref_id, p])) };
};
export const actions = {
  accept: rpc('farmer', 'farmer_respond_po', (f) => ({ p_id: f.id, p_accept: true }), 'Pesanan diterima'),
  reject: rpc('farmer', 'farmer_respond_po', (f) => ({ p_id: f.id, p_accept: false }), 'Pesanan ditolak'),
  ship: rpc('farmer', 'farmer_ship_po', (f) => ({ p_id: f.id }), 'Ditandai dikirim'),
  approve: rpc('farmer', 'farmer_approve_po', (f) => ({ p_id: f.id }), 'Hasil pemeriksaan disetujui, transaksi selesai')
};
