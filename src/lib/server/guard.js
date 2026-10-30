import { redirect } from '@sveltejs/kit';

/** Wajib login, akun aktif, dan (opsional) role tertentu. Dipakai di setiap load & action. */
export async function guard(locals, roles) {
  const { user, profile } = await locals.auth();
  if (!user) throw redirect(303, '/login');
  if (!profile || !profile.is_active) {
    await locals.supabase.auth.signOut();
    throw redirect(303, '/login?err=nonaktif');
  }
  if (roles && ![].concat(roles).includes(profile.role)) throw redirect(303, '/dashboard');
  return { user, profile, sb: locals.supabase };
}
