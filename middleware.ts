// middleware.ts
/**
 * middleware.ts
 * ---------------------------------------------------------------------------
 * Runs on every request matching `config.matcher` below — i.e. every
 * navigation into /admin/**, /login, /register, /checkout — before the App
 * Router even starts rendering. Responsibilities:
 *   1) Verify the session (auth.getUser() — a real network round trip to
 *      Supabase's Auth server, not a local cookie decode).
 *   2) Resolve the user's role, to gate /admin/** to admins only.
 *   3) Redirect based on route + auth/role state (see the numbered blocks).
 *
 * PERFORMANCE: step (2) used to always be a second network round trip (a
 * `profiles` table SELECT), on top of step (1), on every single matched
 * navigation. It now reads `role` straight off the JWT claims first — see
 * the `custom_access_token_hook` function added in supabase_migrations.sql,
 * which injects `role` into the token at sign-in/refresh — and only falls
 * back to the `profiles` query if that claim isn't present yet (e.g. before
 * the hook is enabled in the Supabase dashboard, or for a session issued
 * before it was turned on). Once the hook is enabled project-wide, this
 * fallback effectively stops firing and admin routing drops one full
 * network round trip per navigation.
 * ---------------------------------------------------------------------------
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    let role: string | null = null
    if (user) {
        // Fast path: role was injected into the JWT by custom_access_token_hook
        // (see supabase_migrations.sql) — no extra query needed.
        const claimedRole = (user.app_metadata as { role?: string } | null)?.role
        if (claimedRole) {
            role = claimedRole
        } else {
            // Fallback path: hook not enabled yet (or this session predates it).
            // Same behavior as before, just no longer the default cost.
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            role = profile?.role ?? 'user'
        }
    }

    const isAdminArea = path.startsWith('/admin') && path !== '/admin/login'
    const isAdminLoginPage = path === '/admin/login'
    const isUserLoginPage = path === '/login'
    const isRegisterPage = path === '/register'
    const isCheckoutPage = path === '/checkout'

    // 1) admin area =user+role=admin
    if (isAdminArea) {
        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
        return supabaseResponse
    }

    // 2) protect checkout page no checkout without login 
    if (isCheckoutPage && !user) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', '/checkout')
        return NextResponse.redirect(url)
    }

    // 3) أدمن مسجل دخول وحاول يفتح login/register بتاعت اليوزر أو admin/login تاني
    if (user && role === 'admin' && (isAdminLoginPage || isUserLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // 4) يوزر عادي مسجل دخول وحاول يفتح login/register تاني
    if (user && role === 'user' && (isUserLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/register', '/checkout'],
}