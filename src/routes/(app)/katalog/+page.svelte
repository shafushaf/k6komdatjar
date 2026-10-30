<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import { rp, kg, tgl, photo } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Katalog | AgriSupply</title></svelte:head>
<h1>Katalog produk pertanian</h1>
<Flash {form} />
<form class="filters" method="GET">
  <div><label for="q">Cari produk</label><input id="q" name="q" value={data.f.q ?? ''} /></div>
  <div><label for="cat">Kategori</label><select id="cat" name="cat"><option value="">Semua</option>{#each data.cats as c}<option value={c.id} selected={data.f.cat == c.id}>{c.name}</option>{/each}</select></div>
  <div><label for="gr">Kualitas</label><select id="gr" name="grade"><option value="">Semua</option>{#each ['A', 'B', 'C'] as g}<option selected={data.f.grade === g}>{g}</option>{/each}</select></div>
  <div><label for="lc">Lokasi supplier</label><input id="lc" name="loc" value={data.f.loc ?? ''} /></div>
  <div><label for="mx">Harga maks/kg</label><input id="mx" name="max" type="number" value={data.f.max ?? ''} /></div>
  <div><label for="so">Urutkan harga</label><select id="so" name="sort"><option value="asc">Termurah</option><option value="desc" selected={data.f.sort === 'desc'}>Termahal</option></select></div>
  <button class="btn">Terapkan</button>
</form>
<div class="prods">
  {#each data.items as p (p.id)}
    <div class="prod"><div class="ph">{#if p.photo_path}<img src={photo(p.photo_path)} alt={p.commodity} loading="lazy" />{:else}🌿{/if}</div>
      <div class="bd"><h3 style="margin:0"><a href={`/katalog/${p.id}`}>{p.commodity}</a></h3><span class="price">{rp(p.price_per_kg)}/kg</span>
        <span class="sm muted">{p.supplier_name} · {p.location ?? '-'}</span><span class="sm muted">Stok {kg(p.available_kg)} · panen {tgl(p.harvest_date)}</span><div><Badge s={p.grade} grade /></div>
        <form method="POST" action="?/add" use:enhance class="inline" style="margin-top:6px"><input type="hidden" name="id" value={p.id} /><input name="qty" type="number" min="1" max={p.available_kg} step="0.01" placeholder="kg" required style="width:90px" /><button class="btn s">+ Keranjang</button></form></div></div>
  {:else}<div class="empty" style="grid-column:1/-1">Belum ada produk yang cocok. Supplier perlu mengaktifkan produk di katalog mereka.</div>{/each}
</div>
