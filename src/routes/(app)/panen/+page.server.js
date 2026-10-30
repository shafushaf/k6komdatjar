import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';
import { rpc, num, upload } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals, 'farmer');
  const [o, c] = await Promise.all([
    sb.from('harvest_offers').select('*').eq('farmer_id', user.id).order('created_at', { ascending: false }),
    sb.from('categories').select('id,name').order('id')
  ]);
  return { offers: o.data ?? [], cats: c.data ?? [] };
};

export const actions = {
  create: async ({ request, locals }) => {
    const { user, sb } = await guard(locals, 'farmer');
    const f = await request.formData();
    const v = (k) => String(f.get(k) ?? '').trim();
    const qty = num(f.get('qty_kg')), price = num(f.get('price_per_kg'));
    if (v('commodity').length < 3) return fail(400, { error: 'Nama komoditas minimal 3 karakter.' });
    if (!(qty > 0) || !(price > 0)) return fail(400, { error: 'Jumlah dan harga harus lebih dari 0.' });
    if (!['A', 'B', 'C'].includes(v('grade'))) return fail(400, { error: 'Pilih grade A, B, atau C.' });
    if (!v('harvest_date') || !v('location')) return fail(400, { error: 'Tanggal panen dan lokasi wajib diisi.' });
    const up = await upload(sb, 'offers', f.get('photo'), user.id);
    if (up.error) return fail(400, { error: up.error });
    const { error } = await sb.from('harvest_offers').insert({
      farmer_id: user.id, category_id: Number(v('category_id')) || null, commodity: v('commodity'), photo_path: up.path,
      qty_kg: qty, remaining_kg: qty, price_per_kg: price, harvest_date: v('harvest_date'), grade: v('grade'), location: v('location')
    });
    if (error) {
      if (up.path) await sb.storage.from('offers').remove([up.path]);
      return fail(400, { error: error.code === '42501' ? 'Akun belum diverifikasi admin atau data tidak valid.' : error.message });
    }
    return { ok: 'Penawaran hasil panen dipublikasikan' };
  },
  close: rpc('farmer', 'close_offer', (f) => ({ p_id: f.id }), 'Penawaran ditutup'),
  remove: async ({ request, locals }) => {
    const { user, sb } = await guard(locals, 'farmer');
    const id = (await request.formData()).get('id');
    const { data: o } = await sb.from('harvest_offers').select('photo_path').eq('id', id).eq('farmer_id', user.id).maybeSingle();
    const { error } = await sb.from('harvest_offers').delete().eq('id', id).eq('farmer_id', user.id);
    if (error) return fail(400, { error: 'Penawaran sudah memiliki pesanan, tidak bisa dihapus. Tutup saja.' });
    if (o?.photo_path) await sb.storage.from('offers').remove([o.photo_path]);
    return { ok: 'Penawaran dihapus' };
  }
};
