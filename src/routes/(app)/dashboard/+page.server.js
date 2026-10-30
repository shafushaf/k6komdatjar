import { guard } from '$lib/server/guard.js';
import { monthly, sum } from '$lib/stats.js';
import { rp, kg, tgl } from '$lib/utils.js';

const G = '#4caf50', D = '#1f5c25', Y = '#f2b705';
const val = (p) => Number(p.actual_kg ?? p.qty_kg) * Number(p.price_per_kg);

export const load = async ({ locals }) => {
  const { user, profile, sb } = await guard(locals);
  const role = profile.role;
  let cards = [], charts = [], table = null, extra = null;

  if (role === 'farmer') {
    const [o, p] = await Promise.all([
      sb.from('harvest_offers').select('qty_kg,status').eq('farmer_id', user.id),
      sb.from('purchase_orders').select('code,commodity,qty_kg,actual_kg,price_per_kg,status,created_at').eq('farmer_id', user.id).order('created_at', { ascending: false })
    ]);
    const offers = o.data ?? [], pos = p.data ?? [], done = pos.filter((x) => x.status === 'completed');
    cards = [['🌾', 'Total hasil panen', kg(sum(offers, (x) => x.qty_kg))], ['📣', 'Penawaran aktif', offers.filter((x) => x.status === 'active').length], ['💰', 'Total penjualan', rp(sum(done, val))], ['📥', 'Pesanan masuk (pending)', pos.filter((x) => x.status === 'pending').length]];
    const m = monthly(done, 'created_at', val);
    charts = [{ title: 'Penjualan 6 bulan (Rp)', type: 'bar', labels: m.labels, datasets: [{ label: 'Penjualan', data: m.values, backgroundColor: G }] }];
    table = { title: 'Transaksi terbaru', head: ['Kode', 'Komoditas', 'Jumlah', 'Nilai', 'Tanggal', 'Status'], rows: pos.slice(0, 6).map((x) => [x.code, x.commodity, kg(x.actual_kg ?? x.qty_kg), rp(val(x)), tgl(x.created_at), { s: x.status }]) };
  }

  if (role === 'supplier') {
    const [p, b, s, it] = await Promise.all([
      sb.from('purchase_orders').select('actual_kg,qty_kg,price_per_kg,status,created_at').eq('supplier_id', user.id),
      sb.from('inventory_batches').select('on_hand_kg').eq('supplier_id', user.id),
      sb.from('store_orders').select('code,subtotal,status,created_at').eq('supplier_id', user.id).order('created_at', { ascending: false }),
      sb.from('store_order_items').select('commodity,qty_kg,price_per_kg,cost_per_kg,store_orders!inner(status,supplier_id)').eq('store_orders.status', 'completed').eq('store_orders.supplier_id', user.id)
    ]);
    const pos = (p.data ?? []).filter((x) => x.status === 'completed'), so = s.data ?? [], done = so.filter((x) => x.status === 'completed'), items = it.data ?? [];
    const rev = sum(done, (x) => x.subtotal), profit = sum(items, (i) => i.qty_kg * (i.price_per_kg - i.cost_per_kg));
    cards = [['🧾', 'Total pembelian', rp(sum(pos, val))], ['🏭', 'Total stok gudang', kg(sum(b.data ?? [], (x) => x.on_hand_kg))], ['💰', 'Total pendapatan', rp(rev)], ['🚚', 'Pesanan toko (pending)', so.filter((x) => x.status === 'pending').length], ['📈', 'Perkiraan untung/rugi', rp(profit)]];
    const a = monthly(pos, 'created_at', val), c = monthly(done, 'created_at', (x) => x.subtotal);
    charts = [{ title: 'Pembelian vs penjualan (Rp)', type: 'bar', labels: a.labels, datasets: [{ label: 'Pembelian', data: a.values, backgroundColor: Y }, { label: 'Penjualan', data: c.values, backgroundColor: G }] }];
    const byC = {};
    for (const i of items) { const k = (byC[i.commodity] ??= { kg: 0, rev: 0, pf: 0 }); k.kg += +i.qty_kg; k.rev += i.qty_kg * i.price_per_kg; k.pf += i.qty_kg * (i.price_per_kg - i.cost_per_kg); }
    table = { title: 'Laporan untung/rugi per komoditas (pesanan selesai)', head: ['Komoditas', 'Terjual', 'Pendapatan', 'Untung / (Rugi)'], rows: Object.entries(byC).map(([k, v]) => [k, kg(v.kg), rp(v.rev), rp(v.pf)]) };
  }

  if (role === 'store') {
    const { data } = await sb.from('store_orders').select('code,total,status,created_at').eq('store_id', user.id).order('created_at', { ascending: false });
    const so = data ?? [], done = so.filter((x) => x.status === 'completed');
    cards = [['🧺', 'Total pembelian (selesai)', done.length], ['⏳', 'Pesanan berlangsung', so.filter((x) => ['pending', 'awaiting_payment', 'paid', 'processing', 'shipped'].includes(x.status)).length], ['💸', 'Total pengeluaran', rp(sum(done, (x) => x.total))]];
    const m = monthly(done, 'created_at', (x) => x.total);
    charts = [{ title: 'Pengeluaran 6 bulan (Rp)', type: 'line', labels: m.labels, datasets: [{ label: 'Pengeluaran', data: m.values, borderColor: D, backgroundColor: G, tension: 0.3 }] }];
    table = { title: 'Riwayat belanja', head: ['Kode', 'Total', 'Tanggal', 'Status'], rows: so.slice(0, 8).map((x) => [x.code, rp(x.total), tgl(x.created_at), { s: x.status }]) };
  }

  if (role === 'admin') {
    const cnt = (r) => sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', r);
    const [f, s, t, pr, so, po, it, pend] = await Promise.all([cnt('farmer'), cnt('supplier'), cnt('store'),
      sb.from('supplier_products').select('*', { count: 'exact', head: true }),
      sb.from('store_orders').select('total,status,created_at'), sb.from('purchase_orders').select('*', { count: 'exact', head: true }),
      sb.from('store_order_items').select('commodity,qty_kg,store_orders!inner(status)').eq('store_orders.status', 'completed'),
      sb.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_verification')]);
    const orders = so.data ?? [], done = orders.filter((x) => x.status === 'completed');
    cards = [['👩‍🌾', 'Petani', f.count ?? 0], ['🏭', 'Supplier', s.count ?? 0], ['🏪', 'Toko', t.count ?? 0], ['🥬', 'Produk dijual', pr.count ?? 0], ['🔁', 'Total transaksi', orders.length + (po.count ?? 0)], ['💰', 'Nilai transaksi (selesai)', rp(sum(done, (x) => x.total))]];
    const m = monthly(done, 'created_at', (x) => x.total), byC = {};
    for (const i of it.data ?? []) byC[i.commodity] = (byC[i.commodity] ?? 0) + Number(i.qty_kg);
    charts = [{ title: 'Nilai transaksi toko (Rp)', type: 'line', labels: m.labels, datasets: [{ label: 'Nilai', data: m.values, borderColor: D, backgroundColor: G, tension: 0.3 }] },
      { title: 'Distribusi per komoditas (kg)', type: 'bar', labels: Object.keys(byC), datasets: [{ label: 'kg', data: Object.values(byC), backgroundColor: G }] }];
    extra = { pending: pend.count ?? 0 };
  }
  return { role, cards: cards.map(([i, t, v]) => ({ i, t, v })), charts, table, extra };
};
