<script>
  import Flash from '$lib/Flash.svelte';
  import Act from '$lib/Act.svelte';
  import { ROLE, tgl } from '$lib/utils.js';
  let { data, form } = $props();
</script>
<svelte:head><title>Pengguna | AgriSupply</title></svelte:head>
<div class="row"><h1>Manajemen pengguna</h1>
  <form method="GET" class="inline"><select name="role" onchange={(e) => e.currentTarget.form.submit()}><option value="">Semua peran</option>{#each ['farmer', 'supplier', 'store', 'admin'] as r}<option value={r} selected={data.role === r}>{ROLE[r]}</option>{/each}</select></form></div>
<Flash {form} />
<div class="card tbl"><table><thead><tr><th>Nama</th><th>Peran</th><th>Lokasi / Telepon</th><th>Daftar</th><th>Verifikasi</th><th>Akun</th></tr></thead><tbody>
  {#each data.users as u (u.id)}<tr>
    <td><b>{u.full_name}</b><br /><span class="sm muted">{u.business_name ?? ''}</span></td><td>{ROLE[u.role]}</td><td>{u.location ?? '-'}<br /><span class="sm muted">{u.phone ?? ''}</span></td><td>{tgl(u.created_at)}</td>
    <td>{#if u.is_verified}<span class="badge ok">Terverifikasi</span> <Act action="verify" id={u.id} fields={{ value: 'false' }} label="Cabut" cls="btn s alt" />{:else}<span class="badge warn">Belum</span> <Act action="verify" id={u.id} fields={{ value: 'true' }} label="Verifikasi" />{/if}</td>
    <td>{#if u.is_active}<span class="badge ok">Aktif</span> <Act action="active" id={u.id} fields={{ value: 'false' }} label="Nonaktifkan" cls="btn s danger" ask="Nonaktifkan akun ini?" />{:else}<span class="badge bad">Nonaktif</span> <Act action="active" id={u.id} fields={{ value: 'true' }} label="Aktifkan" />{/if}</td>
  </tr>{/each}
</tbody></table></div>
