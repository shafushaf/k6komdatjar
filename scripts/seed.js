// Seeder demo AgriSupply. Jalankan SETELAH schema.sql: `npm run seed`
// Membuat akun demo + menjalankan transaksi petani→supplier lewat fungsi RPC yang sama dengan aplikasi,
// sehingga stok, batch, dan katalog terbentuk dari alur nyata. Aman dijalankan ulang (dilewati bila data sudah ada).
import { createClient } from '@supabase/supabase-js';

const url = process.env.PUBLIC_SUPABASE_URL, anon = process.env.PUBLIC_SUPABASE_ANON_KEY, svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !svc) { console.error('Isi PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY di file .env'); process.exit(1); }
const opt = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, svc, opt);
const PASS = 'AgriSupply123!';

const USERS = [
  ['admin@agrisupply.test', 'admin', 'Admin AgriSupply', null, 'Jakarta'],
  ['petani1@agrisupply.test', 'farmer', 'Pak Slamet', 'Kebun Sumber Makmur', 'Lembang, Bandung Barat'],
  ['petani2@agrisupply.test', 'farmer', 'Bu Wati', 'Tani Mandiri', 'Karawang'],
  ['supplier1@agrisupply.test', 'supplier', 'Andi Pratama', 'CV Panen Jaya', 'Bandung'],
  ['supplier2@agrisupply.test', 'supplier', 'Rina Kusuma', 'UD Hasil Bumi', 'Bogor'],
  ['toko1@agrisupply.test', 'store', 'Budi Santoso', 'Toko Segar Sentosa', 'Jakarta Selatan'],
  ['toko2@agrisupply.test', 'store', 'Siti Aminah', 'Warung Sayur Bu Siti', 'Depok']
];

async function ensure([email, role, name, biz, loc]) {
  let id;
  const { data, error } = await admin.auth.admin.createUser({ email, password: PASS, email_confirm: true,
    user_metadata: { role: role === 'admin' ? 'store' : role, full_name: name, business_name: biz, location: loc, phone: '081234567890', address: `Jl. Contoh No. 1, ${loc}` } });
  if (error) {
    if (!/already|registered|exists/i.test(error.message)) throw error;
    const list = await admin.auth.admin.listUsers({ perPage: 200 });
    id = list.data.users.find((u) => u.email === email).id;
  } else id = data.user.id;
  const { error: e2 } = await admin.from('profiles').update({ role, is_verified: true, is_active: true }).eq('id', id);
  if (e2) throw e2;
  return id;
}
async function as(email) {
  const c = createClient(url, anon, opt);
  const { error } = await c.auth.signInWithPassword({ email, password: PASS });
  if (error) throw error;
  return c;
}
const call = async (c, fn, args) => { const { data, error } = await c.rpc(fn, args); if (error) throw new Error(`${fn}: ${error.message}`); return data; };

const ids = {};
for (const u of USERS) { ids[u[0]] = await ensure(u); console.log('✔ akun', u[0]); }

const { data: cats } = await admin.from('categories').select('id,name');
const cat = (n) => cats.find((c) => c.name === n)?.id;
const { count } = await admin.from('harvest_offers').select('*', { count: 'exact', head: true });
if (count > 0) { console.log('Data penawaran sudah ada, alur demo dilewati.'); process.exit(0); }

const f1 = await as('petani1@agrisupply.test'), f2 = await as('petani2@agrisupply.test');
const s1 = await as('supplier1@agrisupply.test'), s2 = await as('supplier2@agrisupply.test');
const today = new Date().toISOString().slice(0, 10);
async function offer(c, farmer, o) {
  const { data, error } = await c.from('harvest_offers').insert({ farmer_id: ids[farmer], remaining_kg: o.qty_kg, harvest_date: today, status: 'active', ...o }).select('id').single();
  if (error) throw error; return data.id;
}
const o = {
  tomat: await offer(f1, 'petani1@agrisupply.test', { commodity: 'Tomat', category_id: cat('Sayuran'), qty_kg: 500, price_per_kg: 8000, grade: 'A', location: 'Lembang' }),
  cabai: await offer(f1, 'petani1@agrisupply.test', { commodity: 'Cabai Rawit', category_id: cat('Rempah-rempah'), qty_kg: 200, price_per_kg: 45000, grade: 'A', location: 'Lembang' }),
  beras: await offer(f2, 'petani2@agrisupply.test', { commodity: 'Beras Medium', category_id: cat('Beras dan Padi'), qty_kg: 1000, price_per_kg: 11000, grade: 'B', location: 'Karawang' }),
  jagung: await offer(f2, 'petani2@agrisupply.test', { commodity: 'Jagung Pipil', category_id: cat('Jagung'), qty_kg: 800, price_per_kg: 6000, grade: 'A', location: 'Karawang' })
};
console.log('✔ penawaran petani');

async function flow(sup, farmer, offerId, qty, actual, grade, storage, sellPrice) {
  const po = await call(sup, 'place_purchase_order', { p_offer: offerId, p_qty: qty });
  await call(farmer, 'farmer_respond_po', { p_id: po, p_accept: true });
  await call(farmer, 'farmer_ship_po', { p_id: po });
  await call(sup, 'supplier_receive_po', { p_id: po, p_actual: actual, p_grade: grade, p_storage: storage });
  await call(farmer, 'farmer_approve_po', { p_id: po });
  const { data: b } = await sup.from('inventory_batches').select('id').eq('purchase_order_id', po).single();
  await call(sup, 'upsert_listing', { p_batch: b.id, p_price: sellPrice, p_listed: true });
}
await flow(s1, f1, o.tomat, 300, 298.5, 'A', 'Rak A1', 10000);
await flow(s1, f1, o.cabai, 100, 99, 'A', 'Cold storage 1', 52000);
await flow(s1, f2, o.beras, 600, 600, 'B', 'Gudang B', 13000);
await flow(s2, f2, o.jagung, 400, 396, 'A', 'Gudang Utama', 7500);
// Satu pesanan petani ke supplier masih pending supaya bisa dicoba manual
await call(s2, 'place_purchase_order', { p_offer: o.tomat, p_qty: 50 });
console.log('✔ transaksi petani → supplier → stok → katalog selesai');
console.log('\nAkun demo (kata sandi semua: ' + PASS + '):');
for (const u of USERS) console.log(' ', u[0].padEnd(28), u[1]);
