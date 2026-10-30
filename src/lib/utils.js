import { env } from '$env/dynamic/public';

export const rp = (n) => 'Rp ' + Math.round(Number(n || 0)).toLocaleString('id-ID');
export const kg = (n) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' kg';
export const tgl = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const photo = (p) => (p ? `${env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/offers/${p}` : null);

export const STATUS = {
  pending: ['Pending', 'warn'], confirmed: ['Confirmed', 'info'], awaiting_payment: ['Menunggu Pembayaran', 'warn'], paid: ['Paid', 'ok'],
  processing: ['Processing', 'info'], shipped: ['Shipped', 'info'], delivered: ['Delivered', 'ok'], completed: ['Completed', 'ok'],
  rejected: ['Rejected', 'bad'], cancelled: ['Cancelled', 'bad'], awaiting_verification: ['Menunggu Verifikasi', 'warn'], verified: ['Terverifikasi', 'ok'],
  open: ['Terbuka', 'warn'], resolved: ['Selesai', 'ok'], active: ['Aktif', 'ok'], closed: ['Ditutup', 'mute'], preparing: ['Disiapkan', 'warn']
};
export const GRADE = { A: 'ok', B: 'info', C: 'warn' };
export const ROLE = { farmer: 'Petani', supplier: 'Supplier', store: 'Toko', admin: 'Admin' };
