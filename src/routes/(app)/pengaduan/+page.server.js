import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';
import { names } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { user, profile, sb } = await guard(locals);
  let q = sb.from('complaints').select('*').order('created_at', { ascending: false }).limit(60);
  if (profile.role !== 'admin') q = q.eq('user_id', user.id);
  const { data } = await q;
  const who = profile.role === 'admin' ? await names(sb, (data ?? []).map((c) => c.user_id)) : {};
  return { items: data ?? [], who };
};
export const actions = {
  create: async ({ request, locals }) => {
    const { user, sb } = await guard(locals);
    const f = await request.formData();
    const subject = String(f.get('subject') ?? '').trim(), body = String(f.get('body') ?? '').trim();
    if (subject.length < 5 || body.length < 10) return fail(400, { error: 'Subjek minimal 5 dan isi minimal 10 karakter.' });
    const { error } = await sb.from('complaints').insert({ user_id: user.id, subject, body, ref_code: String(f.get('ref_code') ?? '').trim() || null });
    return error ? fail(400, { error: error.message }) : { ok: 'Pengaduan terkirim' };
  },
  resolve: async ({ request, locals }) => {
    const { sb } = await guard(locals, 'admin');
    const f = await request.formData();
    const { error } = await sb.from('complaints').update({ status: 'resolved', response: String(f.get('response') ?? '').trim() || null }).eq('id', f.get('id'));
    return error ? fail(400, { error: error.message }) : { ok: 'Pengaduan ditandai selesai' };
  }
};
