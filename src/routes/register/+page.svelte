<script>
  let { data, form } = $props();
  let role = $state(form?.role ?? data.role);
</script>
<svelte:head><title>Daftar | AgriSupply</title></svelte:head>
<div class="wrap auth">
  <div class="side">🌱<h2>Gabung AgriSupply</h2><p class="muted" style="font-size:1rem">Pilih peranmu dalam rantai distribusi.</p></div>
  <form class="card" method="POST">
    <h2>Buat akun</h2>
    {#if form?.error}<div class="alert err">{form.error}</div>{/if}{#if form?.ok}<div class="alert ok">{form.ok}</div>{/if}
    <div class="field"><label for="role">Daftar sebagai</label>
      <select id="role" name="role" bind:value={role}><option value="farmer">Petani</option><option value="supplier">Supplier</option><option value="store">Toko / Pedagang</option></select></div>
    <div class="grid2">
      <div class="field"><label for="fn">Nama lengkap</label><input id="fn" name="full_name" value={form?.full_name ?? ''} required /></div>
      <div class="field"><label for="bn">{role === 'farmer' ? 'Nama kebun/kelompok tani' : 'Nama usaha'} (opsional)</label><input id="bn" name="business_name" value={form?.business_name ?? ''} /></div>
      <div class="field"><label for="ph">Telepon</label><input id="ph" name="phone" value={form?.phone ?? ''} required /></div>
      <div class="field"><label for="lc">Lokasi (kota/kabupaten)</label><input id="lc" name="location" value={form?.location ?? ''} required /></div>
    </div>
    <div class="field"><label for="ad">Alamat</label><input id="ad" name="address" value={form?.address ?? ''} /></div>
    <div class="grid2">
      <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" value={form?.email ?? ''} required /></div>
      <div class="field"><label for="pw">Kata sandi</label><input id="pw" name="password" type="password" minlength="8" required /></div>
    </div>
    <button class="btn" type="submit">Daftar</button>
    <p class="muted">Sudah punya akun? <a href="/login">Masuk</a></p>
  </form>
</div>
