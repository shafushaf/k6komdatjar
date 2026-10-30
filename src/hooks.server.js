import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

export const handle = async ({ event, resolve }) => {
  const supabase = createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }))
    }
  });
  event.locals.supabase = supabase;

  // Memverifikasi token ke server Supabase, hasilnya di-cache selama satu request.
  let cached;
  event.locals.auth = () =>
    (cached ??= (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return { user: null, profile: null };
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      return { user: data.user, profile };
    })());

  return resolve(event, { filterSerializedResponseHeaders: (n) => n === 'content-range' || n === 'x-supabase-api-version' });
};
