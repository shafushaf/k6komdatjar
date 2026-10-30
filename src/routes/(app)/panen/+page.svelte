<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import Act from '$lib/Act.svelte';
  import { rp, kg, tgl, photo } from '$lib/utils.js';
  let { data, form } = $props();
  let busy = $state(false);
</script>
<svelte:head><title>Hasil Panen | AgriSupply</title></svelte:head>
<h1>Hasil panen saya</h1>
<Flash {form} />
<form class="card" method="POST" action="?/create" enctype="multipart/form-data" style="margin-bottom:22px"
  use:enhance={() => { busy = true; return async ({ update }) => { await update(); busy = false; }; }}>
  <h3>Tawarkan hasil panen baru</h3>
  <div class="grid3">
    <div class="field"><label for="cm">Komoditas</label><input id="cm" name="commodity" placeholder="Cabai rawit" required /></div>
    <div class="field"><label for="ct">Kategori</label><select id="ct" name="category_id">{#each data.cats as c}<option value={c.id}>{c.name}</option>{/each}</select></div>
    <div class="field"><label for="gr">Kualitas</label><select id="gr" name="grade"><option>A</option><option>B</option><option>C</option></select></div>
    <div class="field"><label for="qt">Jumlah (kg)</label><input id="qt" name="qty_kg" type="number" min="1" step="0.01" required /></div>
    <div class="field"><label for="pr">Harga per kg (Rp)</label><input id="pr" name="price_per_kg" type="number" min="1" step="1" required /></div>
    <div class="field"><label for="hd">Tanggal panen</label><input id="hd" name="harvest_date" type="date" required /></div>
  </div>
  <div class="grid2">
    <div class="field"><label for="lc">Lokasi pertanian</label><input id="lc" name="location" required /></div>
    <div class="field"><label for="ph">Foto produk (opsional, maks 3 MB)</label><input id="ph" name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></div>
  </div>
  <button class="btn" disabled={busy}>{busy ? 'Menyimpan…' : 'Publikasikan'}</button>
</form>
<div class="tbl card"><table><thead><tr><th>Foto</th><th>Komoditas</th><th>Sisa / Total</th><th>Harga</th><th>Panen</th><th>Lokasi</th><th>Status</th><th></th></tr></thead><tbody>
  {#each data.offers as o (o.id)}<tr>
    <td>{#if o.photo_path}<img src={photo(o.photo_path)} alt={o.commodity} style="width:56px;height:44px;object-fit:cover;border-radius:8px" />{:else}🌿{/if}</td>
    <td><b>{o.commodity}</b><br /><Badge s={o.grade} grade /></td><td>{kg(o.remaining_kg)} / {kg(o.qty_kg)}</td><td>{rp(o.price_per_kg)}/kg</td><td>{tgl(o.harvest_date)}</td><td>{o.location}</td><td><Badge s={o.status} /></td>
    <td>{#if o.status === 'active'}<Act action="close" id={o.id} label="Tutup" cls="btn s alt" ask="Tutup penawaran ini?" />{/if} <Act action="remove" id={o.id} label="Hapus" cls="btn s danger" ask="Hapus penawaran ini?" /></td>
  </tr>{:else}<tr><td colspan="8" class="muted">Belum ada penawaran.</td></tr>{/each}
</tbody></table></div>
