<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import { ROLE } from '$lib/utils.js';
  let { data, form } = $props();
  const p = $derived(data.profile);
</script>
<h1>Profil</h1>
<form class="card" method="POST" use:enhance style="max-width:640px">
  <Flash {form} />
  <p class="muted">Peran: <b>{ROLE[p.role]}</b> · Status: {p.is_verified ? 'Terverifikasi ✅' : 'Menunggu verifikasi'}</p>
  <div class="field"><label for="a">Nama lengkap</label><input id="a" name="full_name" value={p.full_name} required /></div>
  <div class="field"><label for="b">Nama usaha / kebun</label><input id="b" name="business_name" value={p.business_name ?? ''} /></div>
  <div class="grid2"><div class="field"><label for="c">Telepon</label><input id="c" name="phone" value={p.phone ?? ''} required /></div>
    <div class="field"><label for="d">Lokasi</label><input id="d" name="location" value={p.location ?? ''} /></div></div>
  <div class="field"><label for="e">Alamat</label><input id="e" name="address" value={p.address ?? ''} /></div>
  <button class="btn">Simpan</button>
</form>
