<script>
  import { rp, photo } from '$lib/utils.js';
  import Badge from '$lib/Badge.svelte';
  let { data } = $props();
  const icons = ['🥬', '🍎', '🌾', '🌽', '🌶️', '🥥', '🧺'];
  const steps = [['Petani menawarkan panen', 'Unggah komoditas, foto, jumlah, harga, dan grade.'], ['Supplier memesan & memeriksa', 'Supplier memesan, menimbang, dan menyetujui kualitas. Stok masuk per batch.'], ['Supplier menjual ke toko', 'Stok tampil di katalog dengan harga supplier.'], ['Toko checkout & terima', 'Bayar, lacak pengiriman, dan konfirmasi barang diterima.']];
  const reasons = [['🔎', 'Asal barang terlacak', 'Setiap batch mencatat petani asalnya.'], ['🔒', 'Stok tidak pernah minus', 'Reservasi stok otomatis saat checkout.'], ['🧾', 'Pembayaran diverifikasi', 'Bukti transfer baru dianggap sah setelah diperiksa.'], ['📊', 'Dashboard per peran', 'Grafik penjualan, pembelian, dan stok.']];
</script>

<header class="nav"><div class="wrap">
  <a class="logo" href="/">🌾 Agri<b>Supply</b></a>
  <nav class="links">
    <a href="#cara">Cara kerja</a><a href="#produk">Produk</a>
    {#if data.loggedIn}<a class="btn s" href="/dashboard">Buka dashboard</a>{:else}<a href="/login">Masuk</a><a class="btn s" href="/register">Daftar</a>{/if}
  </nav>
</div></header>

<section class="hero"><div class="wrap">
  <div>
    <span class="badge ok">Platform distribusi hasil pertanian</span>
    <h1 style="margin-top:12px">Dari kebun petani sampai rak toko, dalam satu alur.</h1>
    <p class="lead">AgriSupply menghubungkan petani, supplier, dan toko dengan stok, pembayaran, dan pengiriman yang tercatat konsisten.</p>
    <div class="cta"><a class="btn" href="/register?role=farmer">Daftar sebagai Petani</a><a class="btn alt" href="/register?role=supplier">Daftar sebagai Supplier</a><a class="btn alt" href="/register?role=store">Daftar sebagai Toko</a></div>
  </div>
  <div class="chain"><div class="node"><span>👩‍🌾</span> PETANI<br /><small class="muted">menawarkan hasil panen</small></div><div class="node"><span>🏭</span> SUPPLIER<br /><small class="muted">memeriksa, menyimpan, menjual</small></div><div class="node"><span>🏪</span> TOKO<br /><small class="muted">membeli & menerima barang</small></div></div>
</div></section>

<section class="section wrap" id="cara"><h2>Cara kerja platform</h2>
  <div class="steps">{#each steps as s, i}<div class="step"><div class="n">{i + 1}</div><h3>{s[0]}</h3><p class="muted" style="margin:0">{s[1]}</p></div>{/each}</div></section>

<section class="section wrap" style="padding-top:0"><h2>Kategori hasil pertanian</h2>
  <div class="cats">{#each data.cats as c, i}<div class="cat"><span>{icons[i] ?? '🌱'}</span>{c.name}</div>{/each}</div></section>

<section class="section wrap" id="produk" style="padding-top:0"><h2>Produk unggulan</h2>
  {#if data.featured.length === 0}<div class="empty">Belum ada produk yang dijual supplier. Jalankan seeder atau selesaikan satu transaksi petani ke supplier.</div>
  {:else}<div class="prods">{#each data.featured as p}
    <div class="prod"><div class="ph">{#if p.photo_path}<img src={photo(p.photo_path)} alt={p.commodity} loading="lazy" />{:else}🌿{/if}</div>
      <div class="bd"><h3 style="margin:0">{p.commodity}</h3><span class="price">{rp(p.price_per_kg)}/kg</span><span class="sm muted">{p.supplier} · {p.location ?? '-'}</span><div><Badge s={p.grade} grade /></div></div></div>
  {/each}</div>{/if}</section>

<section class="section wrap" style="padding-top:0"><h2>Keunggulan platform</h2>
  <div class="steps">{#each reasons as r}<div class="step"><div style="font-size:2rem">{r[0]}</div><h3>{r[1]}</h3><p class="muted" style="margin:0">{r[2]}</p></div>{/each}</div></section>

<section class="statsband"><div class="wrap">
  <div><b>{data.stats.farmers}</b><span>Petani</span></div><div><b>{data.stats.suppliers}</b><span>Supplier</span></div>
  <div><b>{data.stats.stores}</b><span>Toko</span></div><div><b>{Math.round(data.stats.kg).toLocaleString('id-ID')}</b><span>kg terdistribusi</span></div>
</div></section>

<section class="section wrap"><h2>Kata mereka</h2>
  <div class="steps">
    <div class="step">“Dulu harus keliling cari pembeli. Sekarang tinggal unggah panen dan tunggu pesanan.”<p class="sm muted" style="margin:8px 0 0">Contoh testimoni · Petani cabai</p></div>
    <div class="step">“Stok gudang dan asal batch tercatat rapi, tidak perlu buku catatan lagi.”<p class="sm muted" style="margin:8px 0 0">Contoh testimoni · Supplier</p></div>
    <div class="step">“Harga dan stok jelas, pesanan tinggal dilacak.”<p class="sm muted" style="margin:8px 0 0">Contoh testimoni · Pemilik toko</p></div>
  </div><p class="sm muted">Testimoni di atas adalah contoh tampilan, bukan ulasan pengguna nyata.</p></section>

<footer class="foot"><div class="wrap row"><span>🌾 <b>AgriSupply</b>: Petani → Supplier → Toko</span><span class="sm">Versi awal untuk demonstrasi · pembayaran manual dengan verifikasi admin</span></div></footer>
