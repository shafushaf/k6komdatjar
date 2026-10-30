export const load = async ({ locals }) => {
  const sb = locals.supabase;
  const [stats, feat, cats] = await Promise.all([sb.rpc('public_stats'), sb.rpc('featured_products'), sb.from('categories').select('id,name').order('id')]);
  return { stats: stats.data ?? { farmers: 0, suppliers: 0, stores: 0, kg: 0 }, featured: feat.data ?? [], cats: cats.data ?? [] };
};
