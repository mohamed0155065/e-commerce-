import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
    const redirectWithCookies = (url: URL) => {
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
        return response
    }

    let role: string | null = null
    if (user) {
        const claimedRole = (user.app_metadata as { role?: string } | null)?.role
        if (claimedRole) {
            role = claimedRole
        } else {
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
    const isOrdersPage = path === '/orders'

    if (isAdminArea) {
        if (!user) {
            return redirectWithCookies(new URL('/admin/login', request.url))
        }
        if (role !== 'admin') {
            return redirectWithCookies(new URL('/', request.url))
        }
        return supabaseResponse
    }

    if (isCheckoutPage && !user) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', '/checkout')
        return redirectWithCookies(url)
    }
    if (isOrdersPage && !user) {
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', '/orders')
        return redirectWithCookies(url)
    }

    if (user && role === 'admin' && (isAdminLoginPage || isUserLoginPage || isRegisterPage)) {
        return redirectWithCookies(new URL('/admin/dashboard', request.url))
    }

    if (user && role === 'user' && (isUserLoginPage || isRegisterPage)) {
        return redirectWithCookies(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/register', '/checkout', '/orders'],
}