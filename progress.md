# Progress AgriSupply

> Catatan jujur: kode ditulis tanpa bisa menjalankan `npm install`, build, atau database di lingkungan pembuatnya.
> Sintaks file `.js` sudah diperiksa; file `.svelte` dan `schema.sql` **belum pernah dijalankan**. Uji alur lewat skenario di README, dan kirim pesan error bila ada.

## Selesai dibuat
- [x] Arsitektur SvelteKit + Supabase + adapter Vercel; skema database 18 tabel + 2 view, indeks, RLS di semua tabel
- [x] Auth email+password, 4 role, guard server + RLS, verifikasi & aktivasi akun oleh admin
- [x] Halaman utama (hero, cara kerja, kategori, produk unggulan, statistik, testimoni contoh)
- [x] Dashboard per role dengan kartu statistik, grafik Chart.js, tabel (petani, supplier termasuk laba/rugi, toko, admin)
- [x] Petani: unggah/tutup/hapus penawaran (foto, grade, lokasi), terima/tolak/kirim/setujui pesanan, status pembayaran
- [x] Supplier: pasar panen (cari, filter, urut), pesanan pembelian, penerimaan + berat aktual + grade, pembayaran, gudang per batch/lot, riwayat stok, katalog & harga jual, pesanan toko (konfirmasi/tolak/proses/kirim)
- [x] Toko: katalog (cari, filter, detail, rating supplier), keranjang, checkout (reservasi stok, split per supplier), bayar + bukti, lacak, konfirmasi terima, ulasan
- [x] Admin: pengguna, verifikasi pembayaran (lihat bukti), monitoring transaksi/pengiriman/stok, kategori, biaya layanan, pengaduan
- [x] Validasi status di database, stok tidak bisa minus, `stock_movements` untuk semua perubahan, notifikasi dalam aplikasi, log aktivitas dasar
- [x] Seeder demo (`npm run seed`), README deploy, `.env.example`

## Berbeda dari prompt awal (disederhanakan)
- Satu tabel `profiles` (kolom khusus role) menggantikan `farmer_profiles`/`supplier_profiles`/`store_profiles`
- Satu pesanan pembelian = satu penawaran (tanpa `purchase_order_items`); `supplier_products` = satu produk per batch
- `shipments` hanya untuk pesanan toko; pengiriman petani→supplier cukup lewat status pesanan
- Pembayaran manual/transfer bank saja, tanpa payment gateway; peta Leaflet dan API kurir belum ada (hanya input teks lokasi/kurir/resi)

## Belum dibuat
- [ ] Chat antar pengguna (`conversations`, `messages`)
- [ ] Manajemen konten website oleh admin; testimoni di beranda masih contoh statis
- [ ] Notifikasi email/push (saat ini hanya di dalam aplikasi)
- [ ] Edit penawaran, paginasi di tabel panjang, halaman log aktivitas untuk admin
- [ ] Pengujian otomatis
