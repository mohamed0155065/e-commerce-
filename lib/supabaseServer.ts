import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Creates a Supabase SSR client bound to the current request cookies.
 *
 * Architectural decision:
 * We intentionally keep this server-only. The browser client must never be
 * responsible for privileged admin authorization decisions.
 */
export const supabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            /**
             * Server Components may execute in a read-only cookie context.
             *
             * Middleware is responsible for refreshing the auth session,
             * so failing to mutate cookies here must not crash rendering.
             */
          }
        },
      },
    }
  );
};

/**
 * Request-scoped auth memoization.
 *
 * Both the dashboard layout and its child route need the authenticated user.
 * Without memoization, calling auth.getUser() from both places can result in
 * duplicate Auth verification work during the same RSC render.
 *
 * React cache() is request-scoped here; it does NOT create a global user cache,
 * therefore one user's authentication result cannot leak into another request.
 */
export const getSessionUser = cache(async () => {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("SUPABASE AUTH ERROR:", error);
    return null;
  }

  return user;
});