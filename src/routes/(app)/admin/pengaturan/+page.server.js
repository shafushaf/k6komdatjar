import { fail } from '@sveltejs/kit';
import { guard } from '$lib/server/guard.js';
import { num } from '$lib/server/helpers.js';

export const load = async ({ locals }) => {
  const { sb } = await guard(locals, 'admin');
  const { data } = await sb.from('settings').select('*').eq('key', 'platform_fee_percent').maybeSingle();
  return { fee: data?.value ?? '0' };
};
export const actions = {
  default: async ({ request, locals }) => {
    const { sb } = await guard(locals, 'admin');
    const fee = num((await request.formData()).get('fee'));
    if (!(fee >= 0 && fee <= 20)) return fail(400, { error: 'Biaya layanan harus 0-20%.' });
    const { error } = await sb.from('settings').update({ value: String(fee) }).eq('key', 'platform_fee_percent');
    return error ? fail(400, { error: error.message }) : { ok: 'Biaya layanan diperbarui (berlaku untuk checkout berikutnya)' };
  }
};
