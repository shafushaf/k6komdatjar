import { guard } from '$lib/server/guard.js';

export const load = async ({ locals }) => {
  const { user, sb } = await guard(locals);
  const { data } = await sb.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  return { items: data ?? [] };
};
export const actions = {
  readAll: async ({ locals }) => {
    const { user, sb } = await guard(locals);
    await sb.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    return { ok: 'Semua notifikasi ditandai sudah dibaca' };
  }
};
