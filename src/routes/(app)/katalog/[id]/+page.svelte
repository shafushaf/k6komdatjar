<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import { rp, kg, tgl, photo } from '$lib/utils.js';
  let { data, form } = $props();
  const p = $derived(data.item);
</script>
<svelte:head><title>{p.commodity} | AgriSupply</title></svelte:head>
<p><a href="/katalog">← Katalog</a></p><Flash {form} />
<div class="grid2">
  <div class="prod"><div class="ph" style="aspect-ratio:1/1">{#if p.photo_path}<img src={photo(p.photo_path)} alt={p.commodity} />{:else}🌿{/if}</div></div>
  <div class="card"><h1 style="font-size:2rem">{p.commodity}</h1><Badge s={p.grade} grade />
    <p class="price" style="font:700 1.8rem 'Fraunces',serif;color:var(--g2);margin:10px 0">{rp(p.price_per_kg)} / kg</p>
    <p>Stok tersedia: <b>{kg(p.available_kg)}</b><br />Supplier: <b>{p.supplier_name}</b> · {p.location ?? '-'}<br />Tanggal panen: {tgl(p.harvest_date)}<br />Kode batch: {p.lot_code}</p>
    <p class="muted">Rating supplier: {data.avg ? `${data.avg.toFixed(1)} / 5 (${data.reviews.length} ulasan)` : 'belum ada ulasan'}</p>
    <form method="POST" action="?/add" use:enhance class="inline"><input type="hidden" name="id" value={p.id} /><input name="qty" type="number" min="1" max={p.available_kg} step="0.01" placeholder="jumlah kg" required style="width:130px" /><button class="btn">+ Keranjang</button></form></div>
</div>
<div class="card" style="margin-top:18px"><h3>Ulasan supplier</h3>
  {#each data.reviews as r}<p style="margin:0 0 8px">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} <span class="muted sm">{tgl(r.created_at)}</span><br />{r.comment ?? ''}</p>{:else}<p class="muted">Belum ada ulasan.</p>{/each}</div>
