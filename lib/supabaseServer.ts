import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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