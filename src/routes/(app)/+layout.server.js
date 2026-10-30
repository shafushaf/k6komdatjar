import { guard } from '$lib/server/guard.js';

export const load = async ({ locals }) => {
  const { user, profile, sb } = await guard(locals);
  const { count } = await sb.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
  return { profile, unread: count ?? 0 };
};
