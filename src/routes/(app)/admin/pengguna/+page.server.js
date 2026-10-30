import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';

export const load = async ({ locals, url }) => {
  const { sb } = await guard(locals, 'admin');
  const role = url.searchParams.get('role');
  let q = sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  if (['farmer', 'supplier', 'store', 'admin'].includes(role)) q = q.eq('role', role);
  const { data } = await q;
  return { users: data ?? [], role };
};
const toggle = (col) => async ({ request, locals }) => {
  const { user, sb } = await guard(locals, 'admin');
  const f = await request.formData();
  if (f.get('id') === user.id && col === 'is_active') return fail(400, { error: 'Anda tidak dapat menonaktifkan akun sendiri.' });
  const { error } = await sb.from('profiles').update({ [col]: f.get('value') === 'true' }).eq('id', f.get('id'));
  if (error) return fail(400, { error: error.message });
  await sb.from('activity_logs').insert({ user_id: user.id, action: 'admin_' + col, detail: String(f.get('id')) }).then(() => {}, () => {});
  return { ok: 'Status pengguna diperbarui' };
};
export const actions = { verify: toggle('is_verified'), active: toggle('is_active') };
