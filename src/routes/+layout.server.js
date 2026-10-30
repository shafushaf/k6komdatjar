export const load = async ({ locals }) => {
  const { user } = await locals.auth();
  return { loggedIn: !!user };
};
