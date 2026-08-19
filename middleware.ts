import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware to protect admin and dashboard routes.
 * - Checks if the user is authenticated via Supabase.
 * - Redirects to /login if no user is found.
 */
export async function middleware(request: NextRequest) {
    // Initialize a default response
    let supabaseResponse = NextResponse.next({ request })

    // Create a Supabase server client that works in Next.js middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Use request cookies for authentication
                getAll() {
                    return request.cookies.getAll()
                },
                // Update cookies both in request and response
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    // Recreate NextResponse to attach updated cookies
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    console.log("MIDDLEWARE HIT:", request.nextUrl.pathname)
    console.log("USER:", user?.email ?? "NO USER")

    // If no user is authenticated, redirect to login page
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Allow access to the protected route
    return supabaseResponse
}

/**
 * Apply this middleware only to the following route patterns
 */
export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
}