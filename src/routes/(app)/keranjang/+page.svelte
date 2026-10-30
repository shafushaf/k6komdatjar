<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import { rp, kg } from '$lib/utils.js';
  let { data, form } = $props();
  const ok = $derived(data.lines.filter((x) => x.l));
  const sub = $derived(ok.reduce((a, x) => a + x.qty_kg * x.l.price_per_kg, 0));
</script>
<svelte:head><title>Keranjang | AgriSupply</title></svelte:head>
<h1>Keranjang belanja</h1>
<Flash {form} />
{#if data.lines.length === 0}<div class="empty">Keranjang kosong. <a href="/katalog">Lihat katalog</a></div>{:else}
<div class="grid2" style="grid-template-columns:1.4fr 1fr;align-items:start">
  <div class="card tbl"><table><thead><tr><th>Produk</th><th>Jumlah</th><th>Subtotal</th><th></th></tr></thead><tbody>
    {#each data.lines as x (x.id)}<tr>
      {#if x.l}<td><b>{x.l.commodity}</b> (grade {x.l.grade})<br /><span class="sm muted">{x.l.supplier_name} · {rp(x.l.price_per_kg)}/kg · stok {kg(x.l.available_kg)}</span></td>
        <td><form method="POST" action="?/update" use:enhance class="inline"><input type="hidden" name="id" value={x.id} /><input type="hidden" name="listing" value={x.listing_id} /><input name="qty" type="number" step="0.01" min="0.01" max={x.l.available_kg} value={x.qty_kg} style="width:90px" /><button class="btn s alt">Ubah</button></form></td>
        <td>{rp(x.qty_kg * x.l.price_per_kg)}</td>
      {:else}<td colspan="2" class="muted">Produk tidak lagi tersedia</td><td></td>{/if}
      <td><form method="POST" action="?/remove" use:enhance><input type="hidden" name="id" value={x.id} /><button class="btn s danger">Hapus</button></form></td></tr>{/each}
  </tbody></table></div>
  <form class="card" method="POST" action="?/checkout" use:enhance>
    <h3>Checkout</h3><p>Subtotal: <b>{rp(sub)}</b><br /><span class="sm muted">Biaya layanan platform dan ongkir dihitung saat supplier mengonfirmasi pesanan. Pesanan dipecah per supplier.</span></p>
    <div class="field"><label for="n">Nama penerima</label><input id="n" name="name" value={data.me.name} required /></div>
    <div class="field"><label for="p">Telepon penerima</label><input id="p" name="phone" value={data.me.phone} required /></div>
    <div class="field"><label for="a">Alamat pengiriman</label><textarea id="a" name="address" rows="3" required>{data.me.address}</textarea></div>
    <button class="btn" disabled={ok.length === 0}>Buat pesanan</button>
  </form>
</div>{/if}
