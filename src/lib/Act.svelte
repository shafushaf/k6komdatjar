<script>
  import { enhance } from '$app/forms';
  let { action, id, label, cls = 'btn s', ask = null, fields = {}, children } = $props();
</script>
<form method="POST" action={`?/${action}`} class="inline" use:enhance={({ cancel }) => { if (ask && !confirm(ask)) cancel(); }}>
  <input type="hidden" name="id" value={id} />
  {#each Object.entries(fields) as [k, v]}<input type="hidden" name={k} value={v} />{/each}
  {@render children?.()}
  <button class={cls} type="submit">{label}</button>
</form>
