// lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Helper function to create a Supabase client on the server
export const supabaseServer = async () => {
    // Get the Next.js server cookies store
    const cookieStore = await cookies()

    // Create and return a Supabase client with SSR (server-side) support
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Supabase project URL
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Supabase anon key
        {
            cookies: {
                // Function to retrieve all cookies for Supabase auth
                getAll() {
                    return cookieStore.getAll()
                },
                // Function to set cookies returned by Supabase (e.g., session tokens)
                setAll(cookiesToSet) {
                    try {
                        // Loop through all cookies to set and apply them to the cookie store
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Fail silently if setting cookies fails
                    }
                },
            },
        }
    )
}

/**
 * getSessionUser — the current user, verified once per request.
 * ---------------------------------------------------------------------------
 * PERFORMANCE NOTE: `supabase.auth.getUser()` is a network round trip (it
 * asks Supabase's Auth server to verify the JWT, unlike `getSession()` which
 * only decodes the cookie locally and is NOT safe for server-side
 * authorization). Before this helper existed, app/admin/dashboard/layout.tsx
 * AND every nested page.tsx each called `auth.getUser()` independently —
 * 1 layout + 3 possible pages = up to 2 redundant network calls added to
 * every admin navigation on top of the one middleware.ts already makes.
 *
 * Wrapping it in React's `cache()` makes it request-scoped memoization: the
 * first call in a given request actually hits Supabase, every other call to
 * this exact function *in the same request* (e.g. from both the layout and
 * its child page, which render concurrently in the same RSC pass) reuses
 * that result instead of firing a second network request. This does not
 * weaken the security check — it's the same verified call, just not
 * repeated — and middleware.ts's own getUser() is unaffected (middleware
 * runs in a separate request phase that React's cache() cannot see across).
 * ---------------------------------------------------------------------------
 */
export const getSessionUser = cache(async () => {
    const supabase = await supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    return user
})