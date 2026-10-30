# 🌾 AgriSupply

Platform distribusi hasil pertanian: **PETANI → SUPPLIER → TOKO**, dengan admin sebagai pengawas.
Stack: **SvelteKit** (frontend + server), **Supabase** (Auth, PostgreSQL, Storage), **Vercel** (hosting), **Chart.js** (grafik).

> Prompt awal memakai Laravel/MySQL/Bootstrap. Proyek ini mengikuti permintaan terbaru: SvelteKit + Supabase + Vercel.
> Padanannya: Laravel → SvelteKit server actions; MySQL → PostgreSQL (Supabase); middleware role → `guard()` di server + RLS di database;
> `DB::transaction` → fungsi PostgreSQL (RPC) yang atomik; Bootstrap → CSS sendiri.

## Alur transaksi
**Petani → Supplier:** petani unggah penawaran → supplier memesan (stok penawaran dikunci) → petani terima/tolak → petani kirim →
supplier timbang & periksa (berat aktual, grade) → petani menyetujui → **stok masuk sebagai batch/lot** (asal petani tercatat).
Pembayaran dicatat supplier, diverifikasi admin.

**Supplier → Toko:** supplier atur harga jual per batch → toko pilih, keranjang, checkout (**stok direservasi**, tidak bisa melebihi stok) →
supplier konfirmasi + isi ongkir → toko bayar (unggah bukti) → **admin verifikasi** → status Paid → supplier proses → kirim
(**stok fisik berkurang**) → toko konfirmasi diterima → Completed → toko bisa memberi rating.
Penolakan/pembatalan melepas reservasi. Perubahan status divalidasi di database, jadi tidak bisa melompati tahap.

## Cara deploy

### 1. Supabase
1. Buat project di https://supabase.com.
2. **SQL Editor > New query**, tempel seluruh `supabase/schema.sql`, klik **Run** (membuat tabel, RLS, fungsi transaksi, bucket `offers` & `proofs`).
3. **Project Settings > API**: salin *Project URL* dan *anon public key*.
4. **Authentication > Providers > Email**: matikan *Confirm email* untuk uji cepat (atau biarkan aktif; user harus klik link di email).

### 2. Vercel
1. Upload isi zip ini ke repo GitHub (file `package.json` harus ada di root repo).
2. Vercel > **Add New > Project**, pilih repo. Preset: **SvelteKit**, Root Directory kosong.
3. **Environment Variables**: `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_ANON_KEY`. **Jangan** isi service role key di Vercel.
4. **Deploy**. Lalu di Supabase > **Authentication > URL Configuration**, isi *Site URL* dan *Redirect URLs* dengan alamat Vercel.

### 3. Data demo (opsional, dijalankan di komputer sendiri)
```bash
cp .env.example .env     # isi ketiga nilai, termasuk SUPABASE_SERVICE_ROLE_KEY (Project Settings > API)
npm install
npm run seed
```
Seeder membuat 7 akun terverifikasi (kata sandi `AgriSupply123!`), 4 penawaran, dan menjalankan transaksi petani→supplier sampai stok & katalog terbentuk.
Akun: `admin@`, `petani1@`, `petani2@`, `supplier1@`, `supplier2@`, `toko1@`, `toko2@` + `agrisupply.test`.

**Tanpa seeder**, buat admin manual: daftar satu akun, lalu di SQL Editor:
```sql
update public.profiles set role = 'admin', is_verified = true where id = (select id from auth.users where email = 'EMAILMU');
```
Akun baru (petani/supplier/toko) harus **diverifikasi admin** (menu Pengguna) sebelum bisa membuat penawaran, pesanan, atau checkout.

## Skenario uji cepat
1. Login `toko1@` → Katalog → tambah Tomat → Keranjang → Buat pesanan.
2. Login `supplier1@` → Pesanan Toko → Konfirmasi (isi ongkir).
3. Login `toko1@` → Pesanan Saya → unggah bukti bayar.
4. Login `admin@` → Transaksi & Stok → Verifikasi pembayaran.
5. `supplier1@` → Proses → Kirim (cek stok berkurang di Gudang) → `toko1@` → Konfirmasi diterima → beri ulasan.

## Keamanan
- Role & kepemilikan data dipaksa di **database (RLS)** dan di server (`guard()`), bukan hanya menyembunyikan tombol.
- Semua perubahan transaksi/stok lewat fungsi PostgreSQL `SECURITY DEFINER` yang memeriksa peran, kepemilikan, status, dan stok dengan row lock (`FOR UPDATE`).
- Pendaftaran tidak bisa membuat admin; user tidak bisa mengubah `role`/`is_verified`/`is_active` sendiri (trigger).
- Bukti pembayaran disimpan di bucket **privat**; admin melihat lewat signed URL 10 menit.
- Upload dibatasi tipe & 3 MB. Sesi diverifikasi dengan `auth.getUser()`. Teks dirender Svelte (otomatis di-escape).
- CSRF: form SvelteKit memeriksa origin. SQL injection: semua query lewat parameter Supabase/RPC.

## Struktur
```
supabase/schema.sql   tabel, RLS, fungsi transaksi, storage
scripts/seed.js       seeder demo
src/hooks.server.js   klien Supabase per request
src/lib/server/       guard (role) & helper action
src/routes/(app)/     halaman per role: dashboard, panen, pasar, gudang, katalog, admin/…
```
Lihat `progress.md` untuk status fitur dan batasan.
