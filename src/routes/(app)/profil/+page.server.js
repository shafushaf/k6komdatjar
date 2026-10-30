import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';

export const actions = {
  default: async ({ request, locals }) => {
    const { user, sb } = await guard(locals);
    const f = Object.fromEntries(await request.formData());
    const v = (k) => String(f[k] ?? '').trim();
    if (v('full_name').length < 3) return fail(400, { error: 'Nama minimal 3 karakter.' });
    if (!/^[0-9+\- ]{8,20}$/.test(v('phone'))) return fail(400, { error: 'Nomor telepon tidak valid.' });
    const { error } = await sb.from('profiles').update({ full_name: v('full_name'), business_name: v('business_name') || null, phone: v('phone'), address: v('address'), location: v('location') }).eq('id', user.id);
    return error ? fail(400, { error: error.message }) : { ok: 'Profil diperbarui' };
  }
};
