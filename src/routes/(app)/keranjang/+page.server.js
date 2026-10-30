import { fail, redirect } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';
import { num } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, profile, sb } = await guard(locals, 'store');
  const { data: cart } = await sb.from('cart_items').select('id,listing_id,qty_kg').eq('store_id', user.id);
  const ids = (cart ?? []).map((c) => c.listing_id);
  const { data: ls } = ids.length ? await sb.from('market_listings').select('*').in('id', ids) : { data: [] };
  const map = Object.fromEntries((ls ?? []).map((l) => [l.id, l]));
  return { lines: (cart ?? []).map((c) => ({ ...c, l: map[c.listing_id] ?? null })), me: { name: profile.full_name, phone: profile.phone ?? '', address: profile.address ?? '' } };
};
export const actions = {
  update: async ({ request, locals }) => {
    const { user, sb } = await guard(locals, 'store');
    const f = await request.formData(), qty = num(f.get('qty'));
    if (!(qty > 0)) return fail(400, { error: 'Jumlah harus lebih dari 0.' });
    const { data: l } = await sb.from('market_listings').select('available_kg').eq('id', f.get('listing')).maybeSingle();
    if (!l || qty > Number(l.available_kg)) return fail(400, { error: `Stok tersedia hanya ${l?.available_kg ?? 0} kg.` });
    await sb.from('cart_items').update({ qty_kg: qty }).eq('id', f.get('id')).eq('store_id', user.id);
    return { ok: 'Keranjang diperbarui' };
  },
  remove: async ({ request, locals }) => {
    const { user, sb } = await guard(locals, 'store');
    await sb.from('cart_items').delete().eq('id', (await request.formData()).get('id')).eq('store_id', user.id);
    return { ok: 'Item dihapus' };
  },
  checkout: async ({ request, locals }) => {
    const { sb } = await guard(locals, 'store');
    const f = await request.formData();
    const { error } = await sb.rpc('checkout', { p_name: f.get('name'), p_phone: f.get('phone'), p_address: f.get('address') });
    if (error) return fail(400, { error: error.message });
    throw redirect(303, '/pesanan');
  }
};
