import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';

export const load = async ({ locals }) => {
  const { sb } = await guard(locals, 'admin');
  const { data } = await sb.from('categories').select('*').order('id');
  return { cats: data ?? [] };
};
export const actions = {
  add: async ({ request, locals }) => {
    const { sb } = await guard(locals, 'admin');
    const name = String((await request.formData()).get('name') ?? '').trim();
    if (name.length < 3) return fail(400, { error: 'Nama kategori minimal 3 karakter.' });
    const { error } = await sb.from('categories').insert({ name });
    return error ? fail(400, { error: 'Kategori sudah ada atau tidak valid.' }) : { ok: 'Kategori ditambahkan' };
  },
  remove: async ({ request, locals }) => {
    const { sb } = await guard(locals, 'admin');
    const { error } = await sb.from('categories').delete().eq('id', (await request.formData()).get('id'));
    return error ? fail(400, { error: error.message }) : { ok: 'Kategori dihapus' };
  }
};
