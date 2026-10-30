<script>
  import { enhance } from '$app/forms';
  import Flash from '$lib/Flash.svelte';
  let { data, form } = $props();
</script>
<h1>Pengaturan platform</h1>
<form class="card" method="POST" use:enhance style="max-width:480px"><Flash {form} />
  <div class="field"><label for="f">Biaya layanan platform (% dari subtotal pesanan toko)</label><input id="f" name="fee" type="number" step="0.1" min="0" max="20" value={data.fee} required /></div>
  <button class="btn">Simpan</button></form>
