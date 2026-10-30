import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
  const { user } = await locals.auth();
  if (user) throw redirect(303, '/dashboard');
  const r = url.searchParams.get('role');
  return { role: ['farmer', 'supplier', 'store'].includes(r) ? r : 'farmer' };
};
export const actions = {
  default: async ({ request, locals, url }) => {
    const f = Object.fromEntries(await request.formData());
    const v = (k) => String(f[k] ?? '').trim();
    const values = { role: v('role'), full_name: v('full_name'), business_name: v('business_name'), phone: v('phone'), location: v('location'), address: v('address'), email: v('email') };
    if (!['farmer', 'supplier', 'store'].includes(values.role)) return fail(400, { ...values, error: 'Pilih jenis akun.' });
    if (values.full_name.length < 3) return fail(400, { ...values, error: 'Nama lengkap minimal 3 karakter.' });
    if (!values.location) return fail(400, { ...values, error: 'Lokasi (kota/kabupaten) wajib diisi.' });
    if (!/^[0-9+\- ]{8,20}$/.test(values.phone)) return fail(400, { ...values, error: 'Nomor telepon tidak valid.' });
    if (String(f.password ?? '').length < 8) return fail(400, { ...values, error: 'Kata sandi minimal 8 karakter.' });
    const { data, error } = await locals.supabase.auth.signUp({
      email: values.email, password: String(f.password),
      options: { data: { role: values.role, full_name: values.full_name, business_name: values.business_name, phone: values.phone, address: values.address, location: values.location }, emailRedirectTo: `${url.origin}/login` }
    });
    if (error) return fail(400, { ...values, error: error.message });
    if (data.session) throw redirect(303, '/dashboard');
    return { ...values, ok: 'Pendaftaran berhasil. Cek email untuk konfirmasi, lalu masuk. Akun baru perlu diverifikasi admin sebelum bisa bertransaksi.' };
  }
};
