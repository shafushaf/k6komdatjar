<script>
  import Flash from '$lib/Flash.svelte';
  import Badge from '$lib/Badge.svelte';
  import Act from '$lib/Act.svelte';
  import { rp, kg, tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Transaksi | AgriSupply</title></svelte:head>
<h1>Monitoring transaksi, pembayaran, dan stok</h1>
<Flash {form} />
<div class="card tbl" style="margin-bottom:18px"><h3>Pembayaran</h3><table><thead><tr><th>Tanggal</th><th>Referensi</th><th>Pembayar → Penerima</th><th>Jumlah</th><th>Bukti</th><th>Status</th><th></th></tr></thead><tbody>
  {#each data.payments as p (p.id)}<tr><td>{tgl(p.created_at)}</td><td>{data.codes[p.ref_id] ?? p.kind}</td><td>{data.who[p.payer_id] ?? '-'} → {data.who[p.payee_id] ?? '-'}</td><td>{rp(p.amount)}<br /><span class="sm muted">{p.method === 'manual' ? 'Manual' : 'Transfer'}</span></td>
    <td>{#if data.proofs[p.id]}<a href={data.proofs[p.id]} target="_blank" rel="noopener noreferrer">Lihat bukti</a>{:else if p.proof_path}<span class="sm muted">tersimpan</span>{:else}-{/if}</td><td><Badge s={p.status} /></td>
    <td>{#if p.status === 'awaiting_verification'}<Act action="ok" id={p.id} label="Verifikasi" ask="Pastikan dana sudah benar-benar diterima. Lanjutkan?" /> <Act action="no" id={p.id} label="Tolak" cls="btn s danger" />{/if}</td></tr>
  {:else}<tr><td colspan="7" class="muted">Belum ada pembayaran.</td></tr>{/each}</tbody></table></div>
<div class="card tbl" style="margin-bottom:18px"><h3>Pesanan toko & pengiriman</h3><table><thead><tr><th>Kode</th><th>Toko → Supplier</th><th>Total</th><th>Status</th><th>Pengiriman</th></tr></thead><tbody>
  {#each data.orders as o (o.id)}<tr><td>{o.code}<br /><span class="sm muted">{tgl(o.created_at)}</span></td><td>{data.who[o.store_id] ?? '-'} → {data.who[o.supplier_id] ?? '-'}</td><td>{rp(o.total)}</td><td><Badge s={o.status} /></td><td>{#if data.ship[o.id]}<Badge s={data.ship[o.id].status} /> <span class="sm">{data.ship[o.id].courier ?? ''} {data.ship[o.id].tracking_no ?? ''}</span>{/if}</td></tr>{:else}<tr><td colspan="5" class="muted">Belum ada pesanan.</td></tr>{/each}</tbody></table></div>
<div class="card tbl" style="margin-bottom:18px"><h3>Pembelian supplier ke petani</h3><table><thead><tr><th>Kode</th><th>Supplier ← Petani</th><th>Komoditas</th><th>Jumlah</th><th>Status</th></tr></thead><tbody>
  {#each data.pos as p (p.id)}<tr><td>{p.code}</td><td>{data.who[p.supplier_id] ?? '-'} ← {data.who[p.farmer_id] ?? '-'}</td><td>{p.commodity}</td><td>{kg(p.actual_kg ?? p.qty_kg)}</td><td><Badge s={p.status} /></td></tr>{:else}<tr><td colspan="5" class="muted">Belum ada pembelian.</td></tr>{/each}</tbody></table></div>
<div class="card tbl"><h3>Stok seluruh supplier</h3><table><thead><tr><th>Lot</th><th>Supplier</th><th>Komoditas</th><th>Fisik</th><th>Reservasi</th><th>Tersedia</th></tr></thead><tbody>
  {#each data.batches as b (b.id)}<tr><td>{b.lot_code}</td><td>{data.who[b.supplier_id] ?? '-'}</td><td>{b.commodity} <Badge s={b.grade} grade /></td><td>{kg(b.on_hand_kg)}</td><td>{kg(b.reserved_kg)}</td><td><b>{kg(b.on_hand_kg - b.reserved_kg)}</b></td></tr>{:else}<tr><td colspan="6" class="muted">Belum ada stok.</td></tr>{/each}</tbody></table></div>
