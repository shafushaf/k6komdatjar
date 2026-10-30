import { guard } from '$lib/server/guard.js';
import { rpc, num, names, pay } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals, 'supplier');
  const { data } = await sb.from('purchase_orders').select('*').eq('supplier_id', user.id).order('created_at', { ascending: false });
  const pos = data ?? [];
  const [who, p] = await Promise.all([names(sb, pos.map((x) => x.farmer_id)), sb.from('payments').select('ref_id,status,amount').eq('kind', 'purchase').in('ref_id', pos.map((x) => x.id))]);
  return { pos, who, pay: Object.fromEntries((p.data ?? []).map((x) => [x.ref_id, x])) };
};
export const actions = {
  receive: rpc('supplier', 'supplier_receive_po', (f) => ({ p_id: f.id, p_actual: num(f.actual), p_grade: f.grade, p_storage: f.storage ?? '' }), 'Hasil pemeriksaan dicatat, menunggu persetujuan petani'),
  pay: pay('supplier', 'purchase')
};
