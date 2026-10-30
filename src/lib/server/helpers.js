import { fail } from '@sveltejs/kit';
import { guard } from './guard.js';

/** Membuat form action yang memanggil fungsi RPC (logika & validasi transaksi ada di database). */
export const rpc = (role, name, map, ok = 'Berhasil') => async ({ request, locals }) => {
  const { sb } = await guard(locals, role);
  const f = Object.fromEntries(await request.formData());
  const { error } = await sb.rpc(name, map(f));
  return error ? fail(400, { error: error.message }) : { ok };
};

export const num = (v) => Number(String(v ?? '').replace(',', '.'));

export async function names(sb, ids) {
  const u = [...new Set(ids.filter(Boolean))];
  if (!u.length) return {};
  const { data } = await sb.from('public_profiles').select('id,full_name,business_name').in('id', u);
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.business_name || p.full_name]));
}

export async function upload(sb, bucket, file, uid, types = ['image/jpeg', 'image/png', 'image/webp'], max = 3 * 1024 * 1024) {
  if (!file || typeof file !== 'object' || !file.size) return { path: null };
  if (!types.includes(file.type)) return { error: 'Format file tidak didukung (JPG, PNG, WEBP' + (types.length > 3 ? ', PDF' : '') + ')' };
  if (file.size > max) return { error: 'Ukuran file maksimal 3 MB' };
  const ext = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(path, file, { contentType: file.type });
  return error ? { error: 'Gagal mengunggah file' } : { path };
}

/** Catat pembayaran (upload bukti ke bucket privat + RPC record_payment). */
export const pay = (role, kind) => async ({ request, locals }) => {
  const { sb, user } = await guard(locals, role);
  const f = await request.formData();
  const up = await upload(sb, 'proofs', f.get('proof'), user.id, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
  if (up.error) return fail(400, { error: up.error });
  const { error } = await sb.rpc('record_payment', { p_kind: kind, p_ref: f.get('id'), p_amount: num(f.get('amount')), p_method: f.get('method'), p_proof: up.path });
  if (error) {
    if (up.path) await sb.storage.from('proofs').remove([up.path]);
    return fail(400, { error: error.message });
  }
  return { ok: 'Pembayaran dicatat, menunggu verifikasi admin' };
};
