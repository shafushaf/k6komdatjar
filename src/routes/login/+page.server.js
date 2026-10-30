import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  const { user, profile } = await locals.auth();
  if (user && profile?.is_active) throw redirect(303, '/dashboard');
  return { nonaktif: url.searchParams.get('err') === 'nonaktif' };
};
export const actions = {
  default: async ({ request, locals }) => {
    const f = await request.formData();
    const email = String(f.get('email') ?? '').trim();
    const { error } = await locals.supabase.auth.signInWithPassword({ email, password: String(f.get('password') ?? '') });
    if (error) return fail(400, { error: 'Email atau kata sandi salah, atau email belum dikonfirmasi.', email });
    throw redirect(303, '/dashboard');
  }
};
