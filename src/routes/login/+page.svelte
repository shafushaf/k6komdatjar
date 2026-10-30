<script>
  let { data, form } = $props();
</script>
<svelte:head><title>Masuk | AgriSupply</title></svelte:head>
<div class="wrap auth">
  <div class="side">🌾<h2>Selamat datang kembali</h2><p class="muted" style="font-size:1rem">Masuk untuk mengelola panen, stok, dan pesanan.</p></div>
  <form class="card" method="POST">
    <h2>Masuk</h2>
    {#if data.nonaktif}<div class="alert err">Akun Anda dinonaktifkan. Hubungi admin.</div>{/if}
    {#if form?.error}<div class="alert err">{form.error}</div>{/if}
    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" value={form?.email ?? ''} autocomplete="email" required /></div>
    <div class="field"><label for="password">Kata sandi</label><input id="password" name="password" type="password" autocomplete="current-password" required /></div>
    <button class="btn" type="submit">Masuk</button>
    <p class="muted">Belum punya akun? <a href="/register">Daftar</a> · <a href="/">Beranda</a></p>
  </form>
</div>
