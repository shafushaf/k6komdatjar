<script>
  import { STATUS, GRADE } from '$lib/utils.js';
  let { s, grade = false } = $props();
  const x = $derived(grade ? [`Grade ${s}`, GRADE[s] ?? 'mute'] : (STATUS[s] ?? [s, 'mute']));
</script>
<span class={`badge ${x[1]}`}>{x[0]}</span>
