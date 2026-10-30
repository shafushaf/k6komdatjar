import { redirect } from '@sveltejs/kit';

export const load = () => { throw redirect(303, '/'); };
export const actions = { default: async ({ locals }) => { await locals.supabase.auth.signOut(); throw redirect(303, '/'); } };
