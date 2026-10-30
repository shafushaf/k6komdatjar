<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import { rp, kg, tgl, photo } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Pasar Panen | AgriSupply</title></svelte:head>
<h1>Pasar hasil panen petani</h1>
<Flash {form} />
<form class="filters" method="GET">
  <div><label for="q">Komoditas</label><input id="q" name="q" value={data.f.q ?? ''} placeholder="cabai, beras…" /></div>
  <div><label for="cat">Kategori</label><select id="cat" name="cat"><option value="">Semua</option>{#each data.cats as c}<option value={c.id} selected={data.f.cat == c.id}>{c.name}</option>{/each}</select></div>
  <div><label for="gr">Kualitas</label><select id="gr" name="grade"><option value="">Semua</option>{#each ['A', 'B', 'C'] as g}<option selected={data.f.grade === g}>{g}</option>{/each}</select></div>
  <div><label for="lc">Lokasi</label><input id="lc" name="loc" value={data.f.loc ?? ''} /></div>
  <div><label for="mx">Harga maks/kg</label><input id="mx" name="max" type="number" value={data.f.max ?? ''} /></div>
  <div><label for="so">Urutkan</label><select id="so" name="sort"><option value="">Terbaru</option><option value="asc" selected={data.f.sort === 'asc'}>Harga termurah</option><option value="desc" selected={data.f.sort === 'desc'}>Harga termahal</option></select></div>
  <button class="btn">Terapkan</button>
</form>
<div class="prods">
  {#each data.offers as o (o.id)}
    <div class="prod"><div class="ph">{#if o.photo_path}<img src={photo(o.photo_path)} alt={o.commodity} loading="lazy" />{:else}🌿{/if}</div>
      <div class="bd">
        <h3 style="margin:0">{o.commodity}</h3><span class="price">{rp(o.price_per_kg)}/kg</span>
        <span class="sm muted">{data.who[o.farmer_id] ?? 'Petani'} · {o.location}</span><span class="sm muted">Panen {tgl(o.harvest_date)} · sisa {kg(o.remaining_kg)}</span>
        <div><Badge s={o.grade} grade /></div>
        <form method="POST" action="?/order" use:enhance class="inline" style="margin-top:6px">
          <input type="hidden" name="id" value={o.id} /><input name="qty" type="number" min="1" max={o.remaining_kg} step="0.01" placeholder="kg" required style="width:90px" /><button class="btn s">Pesan</button>
        </form>
      </div></div>
  {:else}<div class="empty" style="grid-column:1/-1">Tidak ada penawaran yang cocok.</div>{/each}
</div>
