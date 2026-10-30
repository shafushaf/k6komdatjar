<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import { rp, kg, tgl } from '$lib/utils.js';
  let { data, form } = $props();
  const MV = { in: 'Masuk', reserve: 'Reservasi', release: 'Lepas reservasi', out: 'Keluar' };
</script>
<svelte:head><title>Gudang | AgriSupply</title></svelte:head>
<h1>Inventaris gudang & katalog toko</h1>
<Flash {form} />
<div class="tbl card" style="margin-bottom:20px"><table><thead><tr><th>Lot / Asal</th><th>Komoditas</th><th>Stok fisik</th><th>Direservasi</th><th>Tersedia</th><th>Modal</th><th>Harga jual ke toko</th></tr></thead><tbody>
  {#each data.batches as b (b.id)}{@const l = data.listings[b.id]}<tr>
    <td><b>{b.lot_code}</b><br /><span class="sm muted">{data.who[b.farmer_id] ?? 'Petani'} · {tgl(b.received_at)}<br />{b.storage_location ?? ''}</span></td>
    <td>{b.commodity}<br /><Badge s={b.grade} grade /></td><td>{kg(b.on_hand_kg)}</td><td>{kg(b.reserved_kg)}</td><td><b>{kg(b.on_hand_kg - b.reserved_kg)}</b></td><td>{rp(b.cost_per_kg)}</td>
    <td><form method="POST" action="?/list" use:enhance class="inline"><input type="hidden" name="id" value={b.id} />
      <input name="price" type="number" min="1" step="1" value={l?.price_per_kg ?? Math.round(b.cost_per_kg * 1.15)} style="width:100px" required />
      <label class="sm" style="margin:0;display:flex;gap:4px;align-items:center"><input type="checkbox" name="listed" checked={l ? l.is_listed : true} style="width:auto" />dijual</label><button class="btn s">Simpan</button></form></td>
  </tr>{:else}<tr><td colspan="7" class="muted">Belum ada stok. Stok masuk setelah pembelian dari petani selesai.</td></tr>{/each}
</tbody></table></div>
<div class="card"><h3>Riwayat perubahan stok</h3><div class="tbl"><table><thead><tr><th>Waktu</th><th>Jenis</th><th>Jumlah</th><th>Referensi</th><th>Catatan</th></tr></thead><tbody>
  {#each data.moves as m (m.id)}<tr><td>{tgl(m.created_at)}</td><td>{MV[m.type]}</td><td>{kg(m.qty_kg)}</td><td class="sm">{m.ref}</td><td class="sm">{m.note}</td></tr>{:else}<tr><td colspan="5" class="muted">Belum ada pergerakan.</td></tr>{/each}
</tbody></table></div></div>
