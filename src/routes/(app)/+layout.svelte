<script>
  import { page } from '$app/state';
  import { ROLE } from '$lib/utils.js';
  let { data, children } = $props();
  let open = $state(false);
  const NAV = {
    farmer: [['/dashboard', '📊', 'Dashboard'], ['/panen', '🌾', 'Hasil Panen Saya'], ['/pesanan-masuk', '📥', 'Pesanan Masuk']],
    supplier: [['/dashboard', '📊', 'Dashboard'], ['/pasar', '🛒', 'Pasar Panen'], ['/pembelian', '🧾', 'Pembelian'], ['/gudang', '🏭', 'Gudang & Katalog'], ['/penjualan', '🚚', 'Pesanan Toko']],
    store: [['/dashboard', '📊', 'Dashboard'], ['/katalog', '🥬', 'Katalog'], ['/keranjang', '🧺', 'Keranjang'], ['/pesanan', '📦', 'Pesanan Saya']],
    admin: [['/dashboard', '📊', 'Dashboard'], ['/admin/pengguna', '👥', 'Pengguna'], ['/admin/transaksi', '💳', 'Transaksi & Stok'], ['/admin/kategori', '🏷️', 'Kategori'], ['/admin/pengaturan', '⚙️', 'Pengaturan']]
  };
  const nav = $derived([...NAV[data.profile.role], ['/notifikasi', '🔔', 'Notifikasi' + (data.unread ? ` (${data.unread})` : '')], ['/pengaduan', '💬', 'Pengaduan'], ['/profil', '👤', 'Profil']]);
</script>

<div class="app">
  <aside class="sidebar" class:open>
    <a class="logo" href="/" style="padding:0 8px;margin-bottom:6px">🌾 Agri<b>Supply</b></a>
    <div class="role">{ROLE[data.profile.role]}</div>
    <nav>{#each nav as n}<a href={n[0]} class:on={page.url.pathname === n[0] || (n[0] !== '/dashboard' && page.url.pathname.startsWith(n[0] + '/'))} onclick={() => (open = false)}><span>{n[1]}</span>{n[2]}</a>{/each}</nav>
  </aside>
  <div>
    <div class="top">
      <button class="btn s alt menu-btn" onclick={() => (open = !open)} aria-label="Menu">☰ Menu</button>
      <span><b>{data.profile.business_name || data.profile.full_name}</b> <span class="muted sm">· {data.profile.location ?? ''}</span></span>
      <form method="POST" action="/logout"><button class="btn s alt" type="submit">Keluar</button></form>
    </div>
    <main class="content">
      {#if !data.profile.is_verified && data.profile.role !== 'admin'}<div class="alert warn">Akun Anda menunggu verifikasi admin. Anda sudah bisa melihat data, tetapi belum bisa membuat penawaran, pesanan, atau checkout.</div>{/if}
      {@render children()}
    </main>
  </div>
</div>
